import { create } from 'zustand';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  signup: async (email: string, password: string, name: string) => {
    const response = await authApi.signup({ email, password, name });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadProfile: async () => {
    try {
      const response = await authApi.getProfile();
      const user = response.data.data;
      set({ user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
