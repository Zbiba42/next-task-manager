import { create } from 'zustand';
import { api } from '@/lib/axios';

export enum TaskStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
}

interface TasksState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    getTasks: (search?: string, status?: TaskStatus) => Promise<void>;
    getTasksIfNeeded: () => Promise<void>;
    createTask: (title: string, description: string) => Promise<void>;
    updateTask: (id: string, updates: { title?: string; description?: string; status?: TaskStatus }) => Promise<void>;
    updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    clearTasks: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    getTasks: async (search?: string, status?: TaskStatus) => {
        try {
            set({ isLoading: true, error: null });
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);

            const response = await api.get(`/tasks?${params.toString()}`);
            set({ tasks: response.data, isLoading: false, isInitialized: true });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({ error: 'Failed to fetch tasks', isLoading: false });
        }
    },

    getTasksIfNeeded: async () => {
        const { isInitialized, isLoading } = get();
        if (!isInitialized && !isLoading) {
            await get().getTasks();
        }
    },

    createTask: async (title: string, description: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.post('/tasks', { title, description });
            const tasks = get().tasks;
            set({ tasks: [response.data, ...tasks], isLoading: false });
        } catch (error) {
            console.error('Failed to create task:', error);
            set({ error: 'Failed to create task', isLoading: false });
        }
    },

    updateTask: async (id: string, updates: { title?: string; description?: string; status?: TaskStatus }) => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.patch(`/tasks/${id}`, updates);
            const tasks = get().tasks.map(task =>
                task.id === id ? response.data : task
            );
            set({ tasks, isLoading: false });
        } catch (error) {
            console.error('Failed to update task:', error);
            set({ error: 'Failed to update task', isLoading: false });
        }
    },

    updateTaskStatus: async (id: string, status: TaskStatus) => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.patch(`/tasks/${id}/status`, { status });
            const tasks = get().tasks.map(task =>
                task.id === id ? response.data : task
            );
            set({ tasks, isLoading: false });
        } catch (error) {
            console.error('Failed to update task:', error);
            set({ error: 'Failed to update task', isLoading: false });
        }
    },

    deleteTask: async (id: string) => {
        try {
            set({ isLoading: true, error: null });
            await api.delete(`/tasks/${id}`);
            const tasks = get().tasks.filter(task => task.id !== id);
            set({ tasks, isLoading: false });
        } catch (error) {
            console.error('Failed to delete task:', error);
            set({ error: 'Failed to delete task', isLoading: false });
        }
    },

    clearTasks: () => {
        set({ tasks: [], isLoading: false, error: null, isInitialized: false });
    },
})); 