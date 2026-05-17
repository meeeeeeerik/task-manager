import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_user');
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
};

export const boardsApi = {
  getAll: () => api.get('/boards'),
  getById: (id: string) => api.get(`/boards/${id}`),
  create: (data: object) => api.post('/boards', data),
  delete: (id: string) => api.delete(`/boards/${id}`),
  addColumn: (boardId: string, data: object) => api.post(`/boards/${boardId}/columns`, data),
  deleteColumn: (boardId: string, colId: string) =>
    api.delete(`/boards/${boardId}/columns/${colId}`),
  moveTask: (boardId: string, data: object) => api.patch(`/boards/${boardId}/move`, data),
};

export const tasksApi = {
  create: (data: object) => api.post('/tasks', data),
  update: (id: string, data: object) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (id: string, text: string) => api.post(`/tasks/${id}/comments`, { text }),
  toggleChecklist: (id: string, itemId: string) => api.patch(`/tasks/${id}/checklist/${itemId}`),
};

export const usersApi = {
  getAll: () => api.get('/users'),
};

export const invitationsApi = {
  getAll: () => api.get('/invitations'),
  send: (boardId: string, email: string) => api.post('/invitations', { boardId, email }),
  accept: (id: string) => api.patch(`/invitations/${id}/accept`),
  decline: (id: string) => api.patch(`/invitations/${id}/decline`),
};
