/**
 * Emotion Badge Component
 * Displays the detected emotion as a colored pill/badge.
 */
import { motion } from 'framer-motion';

const emotionConfig = {
    Happy: { emoji: '😊', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
    Sad: { emoji: '😢', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
    Anxious: { emoji: '😰', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
    Stressed: { emoji: '😤', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
    Angry: { emoji: '😠', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    Confused: { emoji: '🤔', bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
    Neutral: { emoji: '😌', bg: 'bg-gray-100 dark:bg-gray-800/40', text: 'text-gray-700 dark:text-gray-300' },
    Distressed: { emoji: '🆘', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
};

const EmotionBadge = ({ emotion }) => {
    if (!emotion) return null;

    const label = typeof emotion === 'string' ? emotion : emotion.label;
    const config = emotionConfig[label] || emotionConfig.Neutral;

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
        ${config.bg} ${config.text}
      `}
        >
            <span>{config.emoji}</span>
            <span>{label}</span>
        </motion.span>
    );
};

export default EmotionBadge;
