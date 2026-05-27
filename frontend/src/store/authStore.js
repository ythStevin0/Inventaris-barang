import { create } from 'zustand';
import { loginRequest, logoutRequest, meRequest } from '../services/authService';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (email, password) => {
        const response = await loginRequest(email, password);
        const { token, user } = response;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return response;
    },

    logout: async () => {
        await logoutRequest();
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    getMe: async () => {
        const user = await meRequest();
        set({ user });
        return user;
    },
}));

export default useAuthStore;
