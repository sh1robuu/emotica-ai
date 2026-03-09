/**
 * Theme Toggle Component
 * Shows Sun icon in dark mode (click to switch to light)
 * Shows Moon icon in light mode (click to switch to dark)
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2.5 rounded-xl
        bg-primary-100/50 dark:bg-primary-900/40
        border border-primary-200/50 dark:border-primary-700/30
        text-primary-600 dark:text-amber-300
        hover:bg-primary-200/60 dark:hover:bg-primary-800/50
        transition-colors duration-200
        cursor-pointer"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={theme}
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
};

export default ThemeToggle;

