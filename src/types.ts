export type TaskStatus = 'active' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface TaskQueryParams {
  status?: 'all' | TaskStatus;
  priority?: 'all' | TaskPriority;
  overdue?: boolean;
  search?: string;
  sort?: 'newest' | 'oldest' | 'dueDate' | 'priority';
}
