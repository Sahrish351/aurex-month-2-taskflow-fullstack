const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

let inMemoryToken = null;

export function setAuthToken(token) {
  inMemoryToken = token;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
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
    throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status);
  }

  return payload;
}

export const authApi = {
  register(data) {
    return request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
  },
  login(data) {
    return request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
  },
  logout() {
    return request('/api/auth/logout', { method: 'POST' });
  },
  getMe() {
    return request('/api/auth/me');
  },
  updateProfile(data) {
    return request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  },
};

export const taskApi = {
  list(params = {}) {
    const query = new URLSearchParams();
    if (params.overdue) query.set('overdue', 'true');
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.search && params.search.trim()) query.set('search', params.search.trim());
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request(`/api/tasks${qs ? `?${qs}` : ''}`);
  },
  create(data) {
    return request('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
  },
  update(id, data) {
    return request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  toggleStatus(id) {
    return request(`/api/tasks/${id}/status`, { method: 'PATCH' });
  },
  remove(id) {
    return request(`/api/tasks/${id}`, { method: 'DELETE' });
  },
};
