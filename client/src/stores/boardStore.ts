import { makeAutoObservable, runInAction } from 'mobx';
import { boardsApi, tasksApi, usersApi } from '../utils/api';
import type { Board, BoardSummary, Task, Column, User } from '../types';

class BoardStore {
  boards: BoardSummary[] = [];
  activeBoard: Board | null = null;
  allUsers: User[] = [];
  selectedTask: Task | null = null;
  isLoading = false;
  isBoardLoading = false;
  filterPriority: string = 'all';
  filterAssignee: string = 'all';
  searchQuery: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  // ── Setters ──────────────────────────────────────────────
  setSelectedTask = (task: Task | null) => {
    this.selectedTask = task;
  };
  setFilterPriority = (v: string) => {
    this.filterPriority = v;
  };
  setFilterAssignee = (v: string) => {
    this.filterAssignee = v;
  };
  setSearchQuery = (v: string) => {
    this.searchQuery = v;
  };
  clearFilters = () => {
    this.filterPriority = 'all';
    this.filterAssignee = 'all';
    this.searchQuery = '';
  };

  // ── Boards ───────────────────────────────────────────────
  fetchBoards = async () => {
    this.isLoading = true;
    try {
      const [boardsRes, usersRes] = await Promise.all([boardsApi.getAll(), usersApi.getAll()]);
      runInAction(() => {
        this.boards = boardsRes.data;
        this.allUsers = usersRes.data;
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  fetchBoard = async (id: string) => {
    this.isBoardLoading = true;
    try {
      const [boardRes, usersRes] = await Promise.all([boardsApi.getById(id), usersApi.getAll()]);
      runInAction(() => {
        this.activeBoard = boardRes.data;
        this.allUsers = usersRes.data;
        this.isBoardLoading = false;
      });
    } catch {
      runInAction(() => {
        this.isBoardLoading = false;
      });
    }
  };

  createBoard = async (title: string, description: string, color: string) => {
    const res = await boardsApi.create({ title, description, color });
    await this.fetchBoards();
    return res.data.id as string;
  };

  deleteBoard = async (id: string) => {
    await boardsApi.delete(id);
    runInAction(() => {
      this.boards = this.boards.filter((b) => b.id !== id);
    });
  };

  // ── Columns ──────────────────────────────────────────────
  addColumn = async (title: string, color: string) => {
    if (!this.activeBoard) return;
    const res = await boardsApi.addColumn(this.activeBoard.id, { title, color });
    runInAction(() => {
      this.activeBoard!.columns.push(res.data);
    });
  };

  deleteColumn = async (colId: string) => {
    if (!this.activeBoard) return;
    await boardsApi.deleteColumn(this.activeBoard.id, colId);
    runInAction(() => {
      this.activeBoard!.columns = this.activeBoard!.columns.filter((c) => c.id !== colId);
    });
  };

  // ── Tasks ────────────────────────────────────────────────
  createTask = async (columnId: string, data: object) => {
    if (!this.activeBoard) return;
    const res = await tasksApi.create({ ...data, columnId, boardId: this.activeBoard.id });
    runInAction(() => {
      const col = this.activeBoard?.columns.find((c) => c.id === columnId);
      if (col) col.tasks.push(res.data);
    });
  };

  updateTask = async (taskId: string, data: object) => {
    const res = await tasksApi.update(taskId, data);
    runInAction(() => {
      if (this.selectedTask?.id === taskId)
        this.selectedTask = { ...this.selectedTask, ...res.data };
      this.activeBoard?.columns.forEach((col) => {
        const idx = col.tasks.findIndex((t) => t.id === taskId);
        if (idx >= 0) col.tasks[idx] = { ...col.tasks[idx], ...res.data };
      });
    });
  };

  deleteTask = async (taskId: string, columnId: string) => {
    await tasksApi.delete(taskId);
    runInAction(() => {
      const col = this.activeBoard?.columns.find((c) => c.id === columnId);
      if (col) col.tasks = col.tasks.filter((t) => t.id !== taskId);
      if (this.selectedTask?.id === taskId) this.selectedTask = null;
    });
  };

  // ── Drag & Drop ──────────────────────────────────────────
  moveTask = async (taskId: string, fromColId: string, toColId: string, newIndex: number) => {
    if (!this.activeBoard) return;
    // Optimistic update
    runInAction(() => {
      const fromCol = this.activeBoard!.columns.find((c) => c.id === fromColId);
      const toCol = this.activeBoard!.columns.find((c) => c.id === toColId);
      if (!fromCol || !toCol) return;
      const taskIdx = fromCol.tasks.findIndex((t) => t.id === taskId);
      if (taskIdx === -1) return;
      const [task] = fromCol.tasks.splice(taskIdx, 1);
      task.columnId = toColId;
      toCol.tasks.splice(newIndex, 0, task);
    });
    // Sync with server
    await boardsApi.moveTask(this.activeBoard!.id, { taskId, fromColId, toColId, newIndex });
  };

  // ── Comments ─────────────────────────────────────────────
  addComment = async (taskId: string, text: string) => {
    const res = await tasksApi.addComment(taskId, text);
    runInAction(() => {
      if (this.selectedTask?.id === taskId) {
        this.selectedTask.comments.push(res.data);
      }
      this.activeBoard?.columns.forEach((col) => {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) task.comments.push(res.data);
      });
    });
  };

  // ── Checklist ────────────────────────────────────────────
  toggleChecklist = async (taskId: string, itemId: string) => {
    await tasksApi.toggleChecklist(taskId, itemId);
    runInAction(() => {
      const updateTask = (task: Task) => {
        const item = task.checklist.find((c) => c.id === itemId);
        if (item) item.done = !item.done;
      };
      if (this.selectedTask?.id === taskId) updateTask(this.selectedTask);
      this.activeBoard?.columns.forEach((col) => {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) updateTask(task);
      });
    });
  };

  // ── Computed ─────────────────────────────────────────────
  filteredColumns = (columns: Column[]): Column[] => {
    if (this.filterPriority === 'all' && this.filterAssignee === 'all' && !this.searchQuery)
      return columns;
    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((task) => {
        if (this.filterPriority !== 'all' && task.priority !== this.filterPriority) return false;
        if (this.filterAssignee !== 'all' && !task.assigneeIds.includes(this.filterAssignee))
          return false;
        if (this.searchQuery && !task.title.toLowerCase().includes(this.searchQuery.toLowerCase()))
          return false;
        return true;
      }),
    }));
  };

  get hasActiveFilters() {
    return this.filterPriority !== 'all' || this.filterAssignee !== 'all' || !!this.searchQuery;
  }
}

export const boardStore = new BoardStore();
