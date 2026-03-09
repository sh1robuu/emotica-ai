/**
 * Auth Store – Zustand
 * Manages user authentication state with mock JWT token storage.
 * Ready for backend replacement – just swap the login/register logic.
 */
import { create } from 'zustand';

const MOCK_DELAY = 800;

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('emotica-user') || 'null'),
    token: localStorage.getItem('emotica-token') || null,
    isAuthenticated: !!localStorage.getItem('emotica-token'),
    isLoading: false,
    error: null,

    /**
     * Mock login – accepts any email/password.
     * Replace this with real API call to your backend.
     */
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

            // Mock validation
            if (!email || !password) {
                throw new Error('Please fill in all fields');
            }
            if (password.length < 6) {
                throw new Error('Invalid credentials');
            }

            const mockUser = {
                id: 'user_' + Date.now(),
                name: email.split('@')[0],
                email,
                avatar: null,
            };
            const mockToken = 'mock_jwt_' + btoa(email) + '_' + Date.now();

            localStorage.setItem('emotica-user', JSON.stringify(mockUser));
            localStorage.setItem('emotica-token', mockToken);

            set({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
            return true;
        } catch (err) {
            set({ error: err.message, isLoading: false });
            return false;
        }
    },

    /**
     * Mock register – creates a new user account.
     * Replace with real API call.
     */
    register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

            if (!name || !email || !password) {
                throw new Error('Please fill in all fields');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const mockUser = {
                id: 'user_' + Date.now(),
                name,
                email,
                avatar: null,
            };
            const mockToken = 'mock_jwt_' + btoa(email) + '_' + Date.now();

            localStorage.setItem('emotica-user', JSON.stringify(mockUser));
            localStorage.setItem('emotica-token', mockToken);

            set({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
            return true;
        } catch (err) {
            set({ error: err.message, isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('emotica-user');
        localStorage.removeItem('emotica-token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
