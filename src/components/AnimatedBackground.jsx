/**
 * Animated Background Component
 * Renders floating pastel blobs for a calming ambient effect.
 */
import { motion } from 'framer-motion';

const blobs = [
    { color: 'bg-primary-300/30 dark:bg-primary-600/20', size: 'w-72 h-72', x: '10%', y: '20%', delay: 0 },
    { color: 'bg-secondary-300/30 dark:bg-secondary-600/20', size: 'w-96 h-96', x: '60%', y: '10%', delay: 2 },
    { color: 'bg-accent-300/20 dark:bg-accent-600/15', size: 'w-80 h-80', x: '30%', y: '60%', delay: 4 },
    { color: 'bg-primary-200/25 dark:bg-primary-700/15', size: 'w-64 h-64', x: '75%', y: '70%', delay: 1 },
    { color: 'bg-secondary-200/25 dark:bg-secondary-700/15', size: 'w-56 h-56', x: '5%', y: '75%', delay: 3 },
];

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {blobs.map((blob, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full blur-3xl ${blob.color} ${blob.size}`}
                    style={{ left: blob.x, top: blob.y }}
                    animate={{
                        x: [0, 30, -20, 10, 0],
                        y: [0, -20, 15, -10, 0],
                        scale: [1, 1.1, 0.95, 1.05, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        delay: blob.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};

export default AnimatedBackground;
