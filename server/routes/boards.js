const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { readDB, writeDB, sanitizeUser } = require("../helpers");
const { authMiddleware } = require("../middleware/auth");

// GET /api/boards — boards where user is member
router.get("/", authMiddleware, (req, res) => {
  const db = readDB();
  const boards = db.boards
    .filter((b) => b.members.includes(req.userId))
    .map((b) => ({
      ...b,
      members: b.members
        .map((id) => sanitizeUser(db.users.find((u) => u.id === id)))
        .filter(Boolean),
      taskCount: db.tasks.filter((t) => t.boardId === b.id).length,
    }));
  res.json(boards);
});

// GET /api/boards/:id — full board with columns and tasks
router.get("/:id", authMiddleware, (req, res) => {
  const db = readDB();
  const board = db.boards.find((b) => b.id === req.params.id);
  if (!board) return res.status(404).json({ error: "Board not found" });
  if (!board.members.includes(req.userId))
    return res.status(403).json({ error: "Not a board member" });

  const columns = board.columnOrder
    .map((colId) => {
      const col = db.columns.find((c) => c.id === colId);
      if (!col) return null;
      const tasks = col.taskIds
        .map((taskId) => {
          const task = db.tasks.find((t) => t.id === taskId);
          if (!task) return null;
          return {
            ...task,
            assignees: task.assigneeIds
              .map((id) => sanitizeUser(db.users.find((u) => u.id === id)))
              .filter(Boolean),
            comments: task.comments.map((c) => ({
              ...c,
              author: sanitizeUser(db.users.find((u) => u.id === c.authorId)),
            })),
          };
        })
        .filter(Boolean);
      return { ...col, tasks };
    })
    .filter(Boolean);

  res.json({
    ...board,
    members: board.members
      .map((id) => sanitizeUser(db.users.find((u) => u.id === id)))
      .filter(Boolean),
    columns,
  });
});

// POST /api/boards — create board
router.post("/", authMiddleware, (req, res) => {
  const { title, description, color } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const db = readDB();
  // Create default columns
  const colIds = ["Backlog", "In Progress", "Review", "Done"].map((name) => {
    const col = {
      id: uuid(),
      boardId: "",
      title: name,
      taskIds: [],
      color: "#757575",
    };
    db.columns.push(col);
    return col.id;
  });
  const board = {
    id: uuid(),
    title,
    description: description || "",
    color: color || "#1976D2",
    ownerId: req.userId,
    members: [req.userId],
    columnOrder: colIds,
    createdAt: new Date().toISOString(),
  };
  colIds.forEach((id) => {
    const col = db.columns.find((c) => c.id === id);
    if (col) col.boardId = board.id;
  });
  db.boards.push(board);
  writeDB(db);
  res.status(201).json(board);
});

// DELETE /api/boards/:id
router.delete("/:id", authMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.boards.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Board not found" });
  if (db.boards[idx].ownerId !== req.userId)
    return res.status(403).json({ error: "Only owner can delete" });
  const board = db.boards[idx];
  db.columns = db.columns.filter((c) => c.boardId !== board.id);
  db.tasks = db.tasks.filter((t) => t.boardId !== board.id);
  db.boards.splice(idx, 1);
  writeDB(db);
  res.json({ message: "Board deleted" });
});

// POST /api/boards/:id/columns — add column
router.post("/:id/columns", authMiddleware, (req, res) => {
  const { title, color } = req.body;
  if (!title) return res.status(400).json({ error: "Column title required" });
  const db = readDB();
  const board = db.boards.find((b) => b.id === req.params.id);
  if (!board) return res.status(404).json({ error: "Board not found" });
  const col = {
    id: uuid(),
    boardId: board.id,
    title,
    taskIds: [],
    color: color || "#757575",
  };
  db.columns.push(col);
  board.columnOrder.push(col.id);
  writeDB(db);
  res.status(201).json({ ...col, tasks: [] });
});

// DELETE /api/boards/:id/columns/:colId
router.delete("/:id/columns/:colId", authMiddleware, (req, res) => {
  const db = readDB();
  const board = db.boards.find((b) => b.id === req.params.id);
  if (!board) return res.status(404).json({ error: "Board not found" });
  const colIdx = db.columns.findIndex((c) => c.id === req.params.colId);
  if (colIdx === -1) return res.status(404).json({ error: "Column not found" });
  const col = db.columns[colIdx];
  db.tasks = db.tasks.filter((t) => !col.taskIds.includes(t.id));
  db.columns.splice(colIdx, 1);
  board.columnOrder = board.columnOrder.filter((id) => id !== req.params.colId);
  writeDB(db);
  res.json({ message: "Column deleted" });
});

// PATCH /api/boards/:id/move — move task between columns (drag & drop)
router.patch("/:id/move", authMiddleware, (req, res) => {
  const { taskId, fromColId, toColId, newIndex } = req.body;
  const db = readDB();
  const fromCol = db.columns.find((c) => c.id === fromColId);
  const toCol = db.columns.find((c) => c.id === toColId);
  if (!fromCol || !toCol)
    return res.status(404).json({ error: "Column not found" });

  fromCol.taskIds = fromCol.taskIds.filter((id) => id !== taskId);
  toCol.taskIds.splice(newIndex, 0, taskId);

  const task = db.tasks.find((t) => t.id === taskId);
  if (task) task.columnId = toColId;

  writeDB(db);
  res.json({ message: "Task moved" });
});

module.exports = router;
