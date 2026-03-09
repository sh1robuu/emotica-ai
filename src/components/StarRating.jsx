/**
 * Interactive Star Rating Component
 * Hover + click based 1-5 star rating.
 */
import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ value = 0, onChange, size = 28 }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="cursor-pointer focus:outline-none"
                >
                    <Star
                        size={size}
                        className={`transition-colors duration-200 ${star <= (hovered || value)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-none text-gray-300 dark:text-gray-600'
                            }`}
                    />
                </motion.button>
            ))}
        </div>
    );
};

export default StarRating;
