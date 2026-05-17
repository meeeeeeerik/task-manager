# 🗂️ TaskFlow — Kanban Task Manager

Full-stack Trello-like task manager with React + MobX frontend and Node.js + Express backend.

## 📁 Structure

```
task-manager/
├── client/   ← React + TypeScript + MobX + MUI
└── server/   ← Node.js + Express + JSON database
```

---

## 🚀 Quick Start

```bash
# Terminal 1 — Backend (port 4001)
cd server
npm install
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm install
npm run dev
```

Demo accounts (password: **`password`**): `alex@demo.com` · `sarah@demo.com` · `marcus@demo.com`

---

## ✨ Features

- 📋 Multiple boards with custom colors
- 🗂️ Kanban columns — add, delete, reorder
- 🃏 Task cards with priority, labels, due dates, assignees
- 🖱️ **Drag & Drop** — move tasks between columns (HTML5 DnD API)
- ✅ Checklist with progress bar
- 💬 Comments on tasks
- 👥 Assign tasks to board members
- 🔍 Filter by priority, assignee, search
- 🔐 JWT authentication
- 🌙 Dark / Light theme

---

## 🛠️ Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/boards | My boards |
| POST | /api/boards | Create board |
| GET | /api/boards/:id | Full board data |
| POST | /api/boards/:id/columns | Add column |
| DELETE | /api/boards/:id/columns/:colId | Delete column |
| PATCH | /api/boards/:id/move | Move task (drag&drop) |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/tasks/:id/comments | Add comment |
| PATCH | /api/tasks/:id/checklist/:itemId | Toggle checkbox |

---

## 🧠 MobX Stores

| Store | Handles |
|-------|---------|
| `boardStore` | Boards, columns, tasks, drag&drop, filters |
| `authStore` | Login, register, JWT |
| `themeStore` | Dark/Light mode |
