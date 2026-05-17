const router = require("express").Router();
const { readDB, sanitizeUser } = require("../helpers");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, (req, res) => {
  res.json(readDB().users.map(sanitizeUser));
});

module.exports = router;
