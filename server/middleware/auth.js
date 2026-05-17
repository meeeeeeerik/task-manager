const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "task_manager_secret_2024";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware, JWT_SECRET };
