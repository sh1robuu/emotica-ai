/**
 * Typing Indicator Component
 * Three animated dots that show when the AI is "thinking".
 */
import { motion } from 'framer-motion';

const TypingIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
        >
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-800/90 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-md border border-primary-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">Emotica is thinking</span>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="typing-dot w-2 h-2 rounded-full bg-primary-400 dark:bg-primary-300"
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
