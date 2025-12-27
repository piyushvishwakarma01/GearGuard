import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            login: async (email, password) => {
                try {
                    set({ isLoading: true });
                    const response = await api.post('/api/auth/login', { email, password });
                    const { user, accessToken, refreshToken } = response.data.data;

                    // Store tokens in localStorage
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success(`Welcome back, ${user.full_name}!`);
                    return true;
                } catch (error) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.message || 'Login failed');
                    return false;
                }
            },

            register: async (userData) => {
                try {
                    set({ isLoading: true });
                    const response = await api.post('/api/auth/register', userData);
                    const { user, accessToken, refreshToken } = response.data.data;

                    // Store tokens in localStorage
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Registration successful!');
                    return true;
                } catch (error) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.message || 'Registration failed');
                    return false;
                }
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
                toast.success('Logged out successfully');
            },

            fetchProfile: async () => {
                try {
                    const response = await api.get('/api/auth/me');
                    set({ user: response.data.data });
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            },

            updateProfile: async (profileData) => {
                try {
                    const response = await api.put('/api/auth/profile', profileData);
                    set({ user: response.data.data });
                    toast.success('Profile updated successfully');
                    return true;
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to update profile');
                    return false;
                }
            },

            // Initialize from localStorage
            initialize: () => {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                if (accessToken && refreshToken) {
                    set({
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                    });
                    get().fetchProfile();
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
