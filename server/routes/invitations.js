const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { readDB, writeDB, sanitizeUser } = require("../helpers");
const { authMiddleware } = require("../middleware/auth");

// POST /api/invitations — send invite by email
router.post("/", authMiddleware, (req, res) => {
  const { boardId, email } = req.body;
  if (!boardId || !email)
    return res.status(400).json({ error: "boardId and email required" });

  const db = readDB();
  if (!db.invitations) db.invitations = [];

  const board = db.boards.find((b) => b.id === boardId);
  if (!board) return res.status(404).json({ error: "Board not found" });
  if (!board.members.includes(req.userId))
    return res.status(403).json({ error: "Not a board member" });

  const toUser = db.users.find((u) => u.email === email.toLowerCase().trim());
  if (!toUser)
    return res.status(404).json({ error: "No user found with this email" });
  if (toUser.id === req.userId)
    return res.status(400).json({ error: "Cannot invite yourself" });
  if (board.members.includes(toUser.id))
    return res.status(400).json({ error: "User is already a member" });

  const alreadySent = db.invitations.find(
    (i) =>
      i.boardId === boardId &&
      i.toUserId === toUser.id &&
      i.status === "pending",
  );
  if (alreadySent)
    return res
      .status(400)
      .json({ error: "Invitation already sent to this user" });

  const fromUser = db.users.find((u) => u.id === req.userId);
  const inv = {
    id: uuid(),
    boardId,
    boardTitle: board.title,
    boardColor: board.color,
    fromUserId: req.userId,
    fromUserName: fromUser?.name || "",
    toEmail: toUser.email,
    toUserId: toUser.id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.invitations.push(inv);
  writeDB(db);
  res.status(201).json(inv);
});

// GET /api/invitations — pending invites for current user
router.get("/", authMiddleware, (req, res) => {
  const db = readDB();
  const invitations = (db.invitations || []).filter(
    (i) => i.toUserId === req.userId && i.status === "pending",
  );
  res.json(invitations);
});

// PATCH /api/invitations/:id/accept
router.patch("/:id/accept", authMiddleware, (req, res) => {
  const db = readDB();
  if (!db.invitations)
    return res.status(404).json({ error: "Invitation not found" });

  const inv = db.invitations.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: "Invitation not found" });
  if (inv.toUserId !== req.userId)
    return res.status(403).json({ error: "Forbidden" });
  if (inv.status !== "pending")
    return res.status(400).json({ error: "Invitation already handled" });

  inv.status = "accepted";
  const board = db.boards.find((b) => b.id === inv.boardId);
  if (board && !board.members.includes(req.userId))
    board.members.push(req.userId);

  writeDB(db);
  res.json({ message: "Accepted" });
});

// PATCH /api/invitations/:id/decline
router.patch("/:id/decline", authMiddleware, (req, res) => {
  const db = readDB();
  if (!db.invitations)
    return res.status(404).json({ error: "Invitation not found" });

  const inv = db.invitations.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: "Invitation not found" });
  if (inv.toUserId !== req.userId)
    return res.status(403).json({ error: "Forbidden" });
  if (inv.status !== "pending")
    return res.status(400).json({ error: "Invitation already handled" });

  inv.status = "declined";
  writeDB(db);
  res.json({ message: "Declined" });
});

module.exports = router;
