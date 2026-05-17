const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/boards", require("./routes/boards"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/users", require("./routes/users"));
app.use("/api/invitations", require("./routes/invitations"));

app.get("/api/health", (_req, res) =>
  res.json({ status: "OK", message: "Task Manager API running 🚀" }),
);
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => {
  console.log("\n  🗂️  Task Manager Server started!");
  console.log(`  📡 API: http://localhost:${PORT}`);
  console.log(`  ✅ Health: http://localhost:${PORT}/api/health`);
  console.log('\n  Demo accounts (password: "password"):');
  console.log("    alex@demo.com | sarah@demo.com | marcus@demo.com\n");
});
