import { create } from 'zustand';
import { loginRequest, logoutRequest, meRequest, updateProfileRequest } from '../services/authService';

// Hydrate user dari sessionStorage agar tidak perlu memanggil getMe() berulang
function getStoredUser() {
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const useAuthStore = create((set, get) => ({
    user: getStoredUser(),
    token: sessionStorage.getItem('token') || null,
    isAuthenticated: !!sessionStorage.getItem('token'),

    login: async (email, password) => {
        const response = await loginRequest(email, password);
        const { token, user } = response;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
        return response;
    },

    logout: async () => {
        try { await logoutRequest(); } catch { /* ignore */ }
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    getMe: async () => {
        // Jika user sudah ada di store, langsung kembalikan
        const current = get().user;
        if (current) return current;

        const user = await meRequest();
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user });
        return user;
    },

    updateProfile: async (formData) => {
        const response = await updateProfileRequest(formData);
        const { user } = response;
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user });
        return response;
    },
}));

export default useAuthStore;
