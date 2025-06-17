import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData extends LoginData {
  name: string;
}

export interface RoomData {
  name: string;
  description?: string;
}

export const authApi = {
  login: (data: LoginData) => api.post('/users/login', data),
  signup: (data: SignupData) => api.post('/users/signup', data),
  getProfile: () => api.get('/users/me'),
};

export const roomApi = {
  create: (data: RoomData) => api.post('/users/room', data),
  getBySlug: (slug: string) => api.get(`/users/room/${slug}`),
  getChats: (roomId: string) => api.get(`/users/rooms/${roomId}/chats`),
};

export default api;
