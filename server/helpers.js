const fs = require("fs");
const path = require("path");
const DB_PATH = path.join(__dirname, "db.json");

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const writeDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...u } = user;
  return u;
};

module.exports = { readDB, writeDB, sanitizeUser };
