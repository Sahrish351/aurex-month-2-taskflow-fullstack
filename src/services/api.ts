import type { Task, TaskQueryParams, TaskStats, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

export function getAuthToken() {
  return inMemoryToken;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('X-Requested-With', 'TaskFlow');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const authApi = {
  register(data: { name: string; email: string; password: string }) {
    return request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  login(data: { email: string; password: string }) {
    return request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  logout() {
    return request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },
  getMe() {
    return request<{ user: User }>('/api/auth/me');
  },
  updateProfile(data: { name?: string; currentPassword?: string; newPassword?: string }) {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const taskApi = {
  list(params: TaskQueryParams = {}) {
    const query = new URLSearchParams();
    if (params.overdue) query.set('overdue', 'true');
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.search && params.search.trim()) query.set('search', params.search.trim());
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request<{ tasks: Task[]; stats: TaskStats }>(`/api/tasks${qs ? `?${qs}` : ''}`);
  },
  create(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'active' | 'completed';
    dueDate?: string | null;
  }) {
    return request<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'active' | 'completed';
      dueDate?: string | null;
    }
  ) {
    return request<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  toggleStatus(id: string) {
    return request<{ task: Task }>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
    });
  },
  remove(id: string) {
    return request<{ message: string; id: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
