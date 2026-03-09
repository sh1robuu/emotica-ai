/**
 * Reusable Button Component
 * Supports variants: primary, secondary, ghost, danger
 * Supports sizes: sm, md, lg
 */
import { motion } from 'framer-motion';

const variants = {
    primary:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25',
    secondary:
        'bg-gradient-to-r from-secondary-400 to-secondary-500 text-white hover:from-secondary-500 hover:to-secondary-600 shadow-lg shadow-secondary-500/25',
    ghost:
        'bg-transparent text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30',
    danger:
        'bg-gradient-to-r from-accent-400 to-accent-500 text-white hover:from-accent-500 hover:to-accent-600 shadow-lg shadow-accent-500/25',
};

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-2xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
