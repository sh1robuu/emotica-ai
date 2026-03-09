/**
 * Chat Layout
 * Split layout with collapsible sidebar and main chat area.
 * Used exclusively by the Chat page.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, LogOut, Menu, X, Plus, MessageCircle, Trash2,
    ChevronLeft, Home, MessageSquare
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import useAuthStore from '../store/authStore';
import useChat from '../hooks/useChat';

const ChatLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, logout, user } = useAuthStore();
    const { chats, activeChatId, createNewChat, setActiveChat, deleteChat } = useChat();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleNewChat = () => {
        createNewChat();
        setMobileOpen(false);
    };

    const handleSelectChat = (chatId) => {
        setActiveChat(chatId);
        setMobileOpen(false);
    };

    const Sidebar = (
        <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-300 dark:to-secondary-300 bg-clip-text text-transparent">
                            Emotica AI
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>

                <button
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg shadow-primary-500/25 transition-all cursor-pointer"
                >
                    <Plus size={18} />
                    New Chat
                </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
                {chats.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            No conversations yet. Start a new chat to begin.
                        </p>
                    </div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm ${chat.id === activeChatId
                                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                            onClick={() => handleSelectChat(chat.id)}
                        >
                            <MessageCircle size={16} className="flex-shrink-0" />
                            <span className="flex-1 truncate">{chat.title}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all cursor-pointer"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link
                        to="/"
                        className="p-2.5 rounded-xl text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Home"
                    >
                        <Home size={20} />
                    </Link>
                </div>
                {isAuthenticated && user && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
            {/* Desktop Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden lg:flex flex-col border-r border-white/20 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl overflow-hidden"
                    >
                        {Sidebar}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-[300px] z-50 lg:hidden bg-white dark:bg-gray-900 border-r border-white/20 dark:border-white/5"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                            {Sidebar}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar (mobile menu + collapsed sidebar toggle) */}
                <div className="flex items-center gap-2 p-3 border-b border-white/10 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
                    <button
                        onClick={() => {
                            if (window.innerWidth >= 1024) {
                                setSidebarOpen(!sidebarOpen);
                            } else {
                                setMobileOpen(true);
                            }
                        }}
                        className="p-2 text-gray-500 hover:text-primary-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <Menu size={20} />
                    </button>
                    {!sidebarOpen && (
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                <Heart className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                            <span className="text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-300 dark:to-secondary-300 bg-clip-text text-transparent">
                                Emotica AI
                            </span>
                        </Link>
                    )}
                </div>

                {/* Chat content area */}
                <div className="flex-1 overflow-hidden">{children}</div>
            </div>
        </div>
    );
};

export default ChatLayout;
