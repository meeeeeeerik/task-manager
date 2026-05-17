const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const { readDB, writeDB, sanitizeUser } = require("../helpers");
const { JWT_SECRET, authMiddleware } = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });
  const db = readDB();
  if (db.users.find((u) => u.email === email))
    return res.status(409).json({ error: "Email already registered" });
  const colors = [
    "#1976D2",
    "#E91E63",
    "#4CAF50",
    "#FF9800",
    "#9C27B0",
    "#00BCD4",
  ];
  const newUser = {
    id: uuid(),
    name,
    email,
    password: await bcrypt.hash(password, 10),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    color: colors[db.users.length % colors.length],
  };
  db.users.push(newUser);
  writeDB(db);
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.status(201).json({ token, user: sanitizeUser(newUser) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid email or password" });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: sanitizeUser(user) });
});

router.get("/me", authMiddleware, (req, res) => {
  const user = readDB().users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(sanitizeUser(user));
});

module.exports = router;
