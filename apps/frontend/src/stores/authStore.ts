import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  level: number;
  xp: number;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (
    identifier: string,
    password: string,
    type?: 'email' | 'username'
  ) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (
        identifier: string,
        password: string,
        type: 'email' | 'username' = 'email'
      ) => {
        try {
          set({ isLoading: true, error: null });

          const payload =
            type === 'email'
              ? { email: identifier, password }
              : { username: identifier, password };

          const response = await api.post('/auth/login', payload);

          const { user, token } = response.data;

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`Welcome back, ${user.firstName}!`);
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Login failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post('/auth/register', data);
          const { user, token, message } = response.data;

          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            toast.success(
              `Welcome to DSA Learning Platform, ${user.firstName}!`
            );
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            toast.success(
              message ||
                'Registration successful. Please check your email to verify your account.'
            );
          }
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Registration failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          void error;
        } finally {
          delete api.defaults.headers.common['Authorization'];
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('auth-storage-supabase');

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast.success('Logged out successfully');
        }
      },

      refreshToken: async () => {
        try {
          const { token } = get();
          if (!token) {
            throw new Error('No token available');
          }

          const response = await api.post('/auth/refresh', { token });
          const { token: newToken, user } = response.data;

          // Update token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

          set({
            user,
            token: newToken,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: unknown) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.put('/users/profile', data);
          const updatedUser = response.data;

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });

          toast.success('Profile updated successfully');
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          const { token } = get();
          if (!token) {
            set({ isLoading: false });
            return;
          }

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          const response = await api.get('/auth/me');
          const user = response.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          // If auth check fails, clear auth state
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}
