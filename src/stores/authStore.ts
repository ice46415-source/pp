import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';
  is_available: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;
        set({ user: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signIn: async (email: string, _password: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Invalid email or password');

      localStorage.setItem('user_id', data.id);
      set({ user: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: password,
            full_name: fullName,
            role: 'CUSTOMER',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('user_id', data.id);
      set({ user: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    localStorage.removeItem('user_id');
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));