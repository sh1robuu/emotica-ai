/**
 * Main Layout
 * Shared layout with navigation bar and footer.
 * Used for Landing, Auth, and Feedback pages.
 */
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, LogOut, MessageCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import useAuthStore from '../store/authStore';

const MainLayout = ({ children }) => {
    const { isAuthenticated, logout, user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark transition-colors duration-300">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                                <Heart className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-300 dark:to-secondary-300 bg-clip-text text-transparent">
                                Emotica AI
                            </span>
                        </Link>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/chat"
                                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors"
                                    >
                                        <MessageCircle size={16} />
                                        Chat
                                    </Link>
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-sm text-primary-700 dark:text-primary-300">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        {user?.name}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg shadow-primary-500/25 transition-all"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-white/20 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-white fill-white" />
                                </div>
                                <span className="font-bold text-gray-800 dark:text-gray-200">Emotica AI</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                A compassionate AI companion designed to support students' emotional well-being through empathetic conversations.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Links</h4>
                            <div className="space-y-2">
                                <Link to="/" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Home</Link>
                                <Link to="/chat" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Start Chatting</Link>
                                <Link to="/feedback" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Give Feedback</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Crisis Support</h4>
                            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <p>📞 988 Suicide & Crisis Lifeline</p>
                                <p>💬 Text HOME to 741741</p>
                                <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                                    Emotica AI is not a substitute for professional help.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 text-center text-xs text-gray-400 dark:text-gray-500">
                        © {new Date().getFullYear()} Emotica AI · Made with 💜 for student well-being
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
