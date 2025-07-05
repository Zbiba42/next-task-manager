import { create } from 'zustand';
import { api } from '@/lib/axios';
import { useTasksStore } from './tasks.store';

interface User {
    id: string;
    fullName: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (fullName: string, email: string, password: string) => Promise<void>;
    signOut: () => void;
    initialize: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
    updateProfile: (updates: { fullName?: string; email?: string }) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    initialize: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                set({ isLoading: false });
                return;
            }

            const currentState = useAuthStore.getState();
            if (currentState.user && currentState.token) {
                set({ isLoading: false });
                return;
            }

            const response = await api.get('/auth/profile');
            const user = response.data;

            set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            localStorage.removeItem('token');
            set({ isLoading: false });
            useTasksStore.getState().clearTasks();
        }
    },

    signIn: async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/signin', { email, password });
            const { accessToken } = response.data;
            localStorage.setItem('token', accessToken);

            const profileResponse = await api.get('/auth/profile');
            const user = profileResponse.data;

            set({ token: accessToken, user, isAuthenticated: true });
        } catch (error) {
            console.error('Failed to sign in:', error);
            throw error;
        }
    },

    signUp: async (fullName: string, email: string, password: string) => {
        try {
            await api.post('/auth/signup', { fullName, email, password });
        } catch (error) {
            console.error('Failed to sign up:', error);
            throw error;
        }
    },

    signOut: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        useTasksStore.getState().clearTasks();
    },

    getCurrentUser: async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await api.get('/auth/profile');
                const user = response.data;
                set({ user });
            }
        } catch (error) {
            console.error('Failed to get current user:', error);
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
            useTasksStore.getState().clearTasks();
        }
    },

    updateProfile: async (updates: { fullName?: string; email?: string }) => {
        try {
            const response = await api.patch('/auth/profile', updates);
            const updatedUser = response.data;
            set((state) => ({ user: updatedUser }));
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    },

    updatePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
        try {
            await api.patch('/auth/password', {
                currentPassword,
                newPassword,
                confirmPassword
            });
        } catch (error) {
            console.error('Failed to update password:', error);
            throw error;
        }
    },
})); 