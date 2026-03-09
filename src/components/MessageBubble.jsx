/**
 * Chat Message Bubble Component
 * Renders user and AI messages with distinct styling.
 * AI messages have a soft gradient background for therapeutic feel.
 */
import { motion } from 'framer-motion';
import EmotionBadge from './EmotionBadge';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div className={`max-w-[80%] lg:max-w-[70%] ${isUser ? 'order-1' : 'order-1'}`}>
                {/* Emotion badge for AI messages */}
                {!isUser && message.emotion && (
                    <div className="mb-1.5 ml-1">
                        <EmotionBadge emotion={message.emotion} />
                    </div>
                )}

                <div
                    className={`
            rounded-2xl px-4 py-3 text-[15px] leading-relaxed
            ${isUser
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md'
                            : 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-800/90 text-gray-800 dark:text-gray-100 rounded-bl-md border border-primary-100 dark:border-gray-700'
                        }
            shadow-md
          `}
                >
                    {/* Image attachment */}
                    {message.image && (
                        <img
                            src={message.image}
                            alt="Shared"
                            className="rounded-xl mb-2 max-h-48 object-cover w-full"
                        />
                    )}

                    {/* Message text with line breaks */}
                    <div className="whitespace-pre-wrap">
                        {message.content.split('**').map((part, i) =>
                            i % 2 === 1 ? (
                                <strong key={i}>{part}</strong>
                            ) : (
                                <span key={i}>{part}</span>
                            )
                        )}
                    </div>

                    {/* Timestamp */}
                    <div
                        className={`text-[11px] mt-1.5 ${isUser ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'
                            }`}
                    >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
