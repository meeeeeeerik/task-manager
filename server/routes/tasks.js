const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { readDB, writeDB, sanitizeUser } = require("../helpers");
const { authMiddleware } = require("../middleware/auth");

// POST /api/tasks — create task
router.post("/", authMiddleware, (req, res) => {
  const {
    columnId,
    boardId,
    title,
    description,
    priority,
    label,
    assigneeIds,
    dueDate,
  } = req.body;
  if (!columnId || !boardId || !title)
    return res
      .status(400)
      .json({ error: "columnId, boardId and title required" });
  const db = readDB();
  const col = db.columns.find((c) => c.id === columnId);
  if (!col) return res.status(404).json({ error: "Column not found" });

  const task = {
    id: uuid(),
    columnId,
    boardId,
    title: title.trim(),
    description: description || "",
    priority: priority || "medium",
    label: label || "",
    assigneeIds: assigneeIds || [],
    dueDate: dueDate || "",
    checklist: [],
    comments: [],
    attachments: 0,
    createdAt: new Date().toISOString(),
  };

  db.tasks.push(task);
  col.taskIds.push(task.id);
  writeDB(db);

  res.status(201).json({
    ...task,
    assignees: task.assigneeIds
      .map((id) => sanitizeUser(db.users.find((u) => u.id === id)))
      .filter(Boolean),
  });
});

// PATCH /api/tasks/:id — update task fields
router.patch("/:id", authMiddleware, (req, res) => {
  const db = readDB();
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const allowed = [
    "title",
    "description",
    "priority",
    "label",
    "assigneeIds",
    "dueDate",
    "checklist",
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  writeDB(db);
  res.json({
    ...task,
    assignees: task.assigneeIds
      .map((id) => sanitizeUser(db.users.find((u) => u.id === id)))
      .filter(Boolean),
  });
});

// DELETE /api/tasks/:id
router.delete("/:id", authMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });
  const task = db.tasks[idx];
  const col = db.columns.find((c) => c.id === task.columnId);
  if (col) col.taskIds = col.taskIds.filter((id) => id !== task.id);
  db.tasks.splice(idx, 1);
  writeDB(db);
  res.json({ message: "Task deleted" });
});

// POST /api/tasks/:id/comments — add comment
router.post("/:id/comments", authMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text required" });
  const db = readDB();
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  const comment = {
    id: uuid(),
    authorId: req.userId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  task.comments.push(comment);
  writeDB(db);
  const author = db.users.find((u) => u.id === req.userId);
  res
    .status(201)
    .json({ ...comment, author: author ? sanitizeUser(author) : null });
});

// PATCH /api/tasks/:id/checklist/:itemId — toggle checklist item
router.patch("/:id/checklist/:itemId", authMiddleware, (req, res) => {
  const db = readDB();
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  const item = task.checklist.find((c) => c.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: "Checklist item not found" });
  item.done = !item.done;
  writeDB(db);
  res.json(item);
});

module.exports = router;
