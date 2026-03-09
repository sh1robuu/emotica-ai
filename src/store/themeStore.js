/**
 * Theme Store – Zustand
 * Manages dark/light mode with localStorage persistence.
 * Applies the 'dark' class to <html> for TailwindCSS dark mode.
 */
import { create } from 'zustand';

const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('emotica-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

const useThemeStore = create((set) => {
    const initial = getInitialTheme();
    applyTheme(initial);

    return {
        theme: initial,

        toggleTheme: () =>
            set((state) => {
                const next = state.theme === 'dark' ? 'light' : 'dark';
                localStorage.setItem('emotica-theme', next);
                applyTheme(next);
                return { theme: next };
            }),

        setTheme: (theme) =>
            set(() => {
                localStorage.setItem('emotica-theme', theme);
                applyTheme(theme);
                return { theme };
            }),
    };
});

export default useThemeStore;
