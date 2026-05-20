import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return response.data;
    },

    logout: async () => {
        await api.post('/logout');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    getMe: async () => {
        const response = await api.get('/me');
        set({ user: response.data });
    },
}));

export default useAuthStore;