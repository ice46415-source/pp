import { create } from 'zustand';
import { userAPI } from '../lib/api';

interface User {
  id: number;
  name: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';
  is_available?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const response = await userAPI.getProfile(parseInt(userId));
        if (response.success) {
          set({ user: response.user, loading: false });
        } else {
          set({ loading: false });
        }
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const response = await userAPI.login(email, password);

      if (response.success) {
        localStorage.setItem('user_id', response.user.id.toString());
        set({ user: response.user, loading: false });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      set({ loading: true, error: null });

      const response = await userAPI.register(fullName, email, password, phone);

      if (response.success) {
        localStorage.setItem('user_id', response.user.id.toString());
        set({ user: response.user, loading: false });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    localStorage.removeItem('user_id');
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));