/**
 * Password Strength Indicator
 * Visual bar showing password strength with color transitions.
 */
import { motion } from 'framer-motion';

const getStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 'Weak', color: 'bg-red-400', width: '20%' };
    if (score <= 2) return { level: 'Fair', color: 'bg-orange-400', width: '40%' };
    if (score <= 3) return { level: 'Good', color: 'bg-amber-400', width: '60%' };
    if (score <= 4) return { level: 'Strong', color: 'bg-emerald-400', width: '80%' };
    return { level: 'Very Strong', color: 'bg-green-500', width: '100%' };
};

const PasswordStrength = ({ password = '' }) => {
    if (!password) return null;

    const { level, color, width } = getStrength(password);

    return (
        <div className="mt-2">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Password strength: <span className="font-medium">{level}</span>
            </p>
        </div>
    );
};

export default PasswordStrength;
