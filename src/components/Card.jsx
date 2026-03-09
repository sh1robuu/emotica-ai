/**
 * Glassmorphism Card Component
 * Reusable card with soft backdrop blur, subtle border, and rounded corners.
 */
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
            className={`
        rounded-2xl p-6
        bg-white/60 dark:bg-white/5
        backdrop-blur-xl
        border border-white/40 dark:border-white/10
        shadow-lg shadow-primary-500/5 dark:shadow-black/20
        transition-colors duration-300
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
