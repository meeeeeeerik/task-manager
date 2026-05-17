export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Label = 'feature' | 'bug' | 'design' | 'docs' | 'devops' | 'marketing' | '';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  author: User | null;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string;
  priority: Priority;
  label: Label;
  assigneeIds: string[];
  assignees: User[];
  dueDate: string;
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: number;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string;
  taskIds: string[];
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  description: string;
  color: string;
  ownerId: string;
  members: User[];
  columnOrder: string[];
  columns: Column[];
  taskCount?: number;
  createdAt: string;
}

export interface Invitation {
  id: string;
  boardId: string;
  boardTitle: string;
  boardColor: string;
  fromUserId: string;
  fromUserName: string;
  toEmail: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface BoardSummary {
  id: string;
  title: string;
  description: string;
  color: string;
  ownerId: string;
  members: User[];
  taskCount: number;
  createdAt: string;
}
