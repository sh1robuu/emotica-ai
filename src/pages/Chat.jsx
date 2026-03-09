/**
 * Chat Page – Core Feature
 * Main chat interface with message bubbles, image upload,
 * emotion detection, and crisis safety features.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ImagePlus, X, Sparkles, Heart } from 'lucide-react';
import useChat from '../hooks/useChat';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import EmotionBadge from '../components/EmotionBadge';
import CrisisDisclaimer from '../components/CrisisDisclaimer';

const Chat = () => {
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    const {
        messages,
        currentEmotion,
        isTyping,
        error,
        messagesEndRef,
        sendMessage,
        ensureActiveChat,
    } = useChat();

    // Ensure chat exists on mount
    useEffect(() => {
        ensureActiveChat();
    }, [ensureActiveChat]);

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;

        const text = input.trim();
        const image = selectedImage;

        setInput('');
        setSelectedImage(null);
        setImagePreview(null);

        await sendMessage(text, image);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isCrisis = currentEmotion?.severity === 'critical';

    return (
        <div className="flex flex-col h-full">
            {/* Crisis disclaimer */}
            <CrisisDisclaimer show={isCrisis} />

            {/* Emotion indicator bar */}
            <AnimatePresence>
                {currentEmotion && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-2 border-b border-white/10 dark:border-white/5 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm flex items-center gap-2"
                    >
                        <span className="text-xs text-gray-500 dark:text-gray-400">Detected mood:</span>
                        <EmotionBadge emotion={currentEmotion} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
                {messages.length === 0 ? (
                    /* Welcome state */
                    <div className="h-full flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center max-w-md"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20">
                                <Heart className="w-10 h-10 text-white fill-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                Hi there 💜
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                I'm Emotica, your AI companion. This is a safe space — feel free to share whatever's on your mind. I'm here to listen.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {['How are you?', "I'm feeling stressed", "I need someone to talk to", "I'm doing great!"].map(
                                    (suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setInput(suggestion);
                                                inputRef.current?.focus();
                                            }}
                                            className="px-4 py-2 text-sm rounded-xl bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-gray-700 border border-primary-200/50 dark:border-gray-600 transition-colors cursor-pointer"
                                        >
                                            <Sparkles size={14} className="inline mr-1.5" />
                                            {suggestion}
                                        </button>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* Message list */
                    <div className="max-w-3xl mx-auto">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image preview */}
            <AnimatePresence>
                {imagePreview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pt-3 bg-white/50 dark:bg-gray-900/50 border-t border-white/10 dark:border-white/5"
                    >
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Selected"
                                className="h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-white/50 dark:bg-gray-900/50 border-t border-white/10 dark:border-white/5 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-2">
                        {/* Image upload */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 rounded-xl text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex-shrink-0"
                            title="Upload image"
                        >
                            <ImagePlus size={22} />
                        </motion.button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        {/* Text input */}
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Share what's on your mind..."
                                rows={1}
                                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none text-[15px]"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                }}
                            />
                        </div>

                        {/* Send button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSend}
                            disabled={!input.trim() && !selectedImage}
                            className={`p-3 rounded-xl flex-shrink-0 transition-all cursor-pointer ${input.trim() || selectedImage
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                }`}
                            title="Send message"
                        >
                            <Send size={20} />
                        </motion.button>
                    </div>

                    <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2">
                        Emotica AI is not a substitute for professional mental health support.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Chat;
