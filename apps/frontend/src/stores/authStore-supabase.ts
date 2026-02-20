import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthStore>()(persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        console.log('AuthStore: Attempting login for email:', email);
        try {
          set({ isLoading: true, error: null });
          
          console.log('AuthStore: Calling supabase.auth.signInWithPassword...');
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          console.log('AuthStore: Response from signInWithPassword:', { data, error });

          if (error) {
            console.error('AuthStore: Supabase signInWithPassword error:', error);
            throw error;
          }

          if (data.user && data.session) {
            console.log('AuthStore: Supabase signInWithPassword successful. Fetching user profile...');
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
            console.log('AuthStore: Response from fetching user profile:', { profile, profileError });

            if (profileError) {
              console.error('AuthStore: Error fetching user profile:', profileError);
              throw profileError;
            }

            const user: User = {
              id: profile.id,
              email: profile.email,
              username: profile.username,
              firstName: profile.first_name,
              lastName: profile.last_name,
              avatar: profile.avatar,
              level: profile.level,
              xp: profile.xp,
              isVerified: profile.is_verified,
              isPremium: profile.is_premium,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            };

            set({
              user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            toast.success(`Welcome back, ${user.firstName}!`);
            console.log('AuthStore: Login successful, state updated.');
          } else {
            console.warn('AuthStore: signInWithPassword returned no user or session data.');
            throw new Error('Login failed: No user or session data.');
          }
        } catch (error: unknown) {
          const errorMessage = (error as Error).message || 'Login failed';
          console.error('AuthStore: Login catch block error:', errorMessage);
          set({
            user: null,
            session: null,
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
          
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                username: data.username,
                first_name: data.firstName,
                last_name: data.lastName,
              },
            },
          });

          if (authError) throw authError;

          if (authData.user && authData.session) {
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .insert([
                {
                  id: authData.user.id,
                  email: data.email,
                  username: data.username,
                  first_name: data.firstName,
                  last_name: data.lastName,
                  is_verified: false,
                  is_premium: false,
                  level: 1,
                  xp: 0,
                  coins: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ]);

            if (profileError) throw profileError;

            const user: User = {
              id: authData.user.id,
              email: data.email,
              username: data.username,
              firstName: data.firstName,
              lastName: data.lastName,
              level: 1,
              xp: 0,
              isVerified: false,
              isPremium: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            set({
              user,
              session: authData.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            toast.success(`Welcome to DSA Learning Platform, ${user.firstName}!`);
          }
        } catch (error: unknown) {
          const errorMessage = (error as Error).message || 'Registration failed';
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        console.log('AuthStore: Attempting logout.');
        try {
          console.log('AuthStore: Calling supabase.auth.signOut()...');
          await supabase.auth.signOut();
          console.log('AuthStore: supabase.auth.signOut() completed.');
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast.success('Logged out successfully');
          console.log('AuthStore: Logout successful, state updated.');
        } catch (error) {
          console.error('AuthStore: Logout error:', error);
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const userId = get().user?.id;
          if (!userId) throw new Error('User not authenticated');

          const updateData: any = {};
          if (data.firstName !== undefined) updateData.first_name = data.firstName;
          if (data.lastName !== undefined) updateData.last_name = data.lastName;
          if (data.bio !== undefined) updateData.bio = data.bio;
          if (data.avatar !== undefined) updateData.avatar = data.avatar;

          const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId);

          if (error) throw error;

          // Update local state
          const updatedUser = { ...get().user!, ...data };
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });

          toast.success('Profile updated successfully');
        } catch (error: unknown) {
          const errorMessage = (error as Error).message || 'Profile update failed';
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
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            set({ isLoading: false });
            return;
          }

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile) {
            set({ isLoading: false });
            return;
          }

          const user: User = {
            id: profile.id,
            email: profile.email,
            username: profile.username,
            firstName: profile.first_name,
            lastName: profile.last_name,
            avatar: profile.avatar,
            level: profile.level,
            xp: profile.xp,
            isVerified: profile.is_verified,
            isPremium: profile.is_premium,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          };

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Auth check error:', error);
          set({
            user: null,
            session: null,
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
      name: 'auth-storage-supabase',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}