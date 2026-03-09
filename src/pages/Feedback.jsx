/**
 * Feedback Page
 * Star rating, text feedback, and optional email with success animation.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import useFeedbackStore from '../store/feedbackStore';
import AnimatedBackground from '../components/AnimatedBackground';
import StarRating from '../components/StarRating';
import Button from '../components/Button';

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [email, setEmail] = useState('');
    const { isSubmitting, isSubmitted, submitFeedback, resetForm } = useFeedbackStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;
        await submitFeedback({ rating, text, email });
    };

    const handleReset = () => {
        setRating(0);
        setText('');
        setEmail('');
        resetForm();
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <div className="rounded-3xl p-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl">
                    <AnimatePresence mode="wait">
                        {isSubmitted ? (
                            /* Success State */
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-center py-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                                >
                                    <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    Thank you so much! 💜
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                                    Your feedback helps us make Emotica AI better for every student. We truly appreciate your time.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="ghost" onClick={handleReset}>
                                        Send another
                                    </Button>
                                    <Link to="/chat">
                                        <Button>
                                            Back to Chat
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            /* Form State */
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                                        <Heart className="w-7 h-7 text-white fill-white" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                        We'd love your feedback 🌸
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Your thoughts help us grow and serve you better.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Star Rating */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            How was your experience?
                                        </label>
                                        <div className="flex justify-center">
                                            <StarRating value={rating} onChange={setRating} size={36} />
                                        </div>
                                        {rating > 0 && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center text-sm text-primary-500 dark:text-primary-400 mt-2"
                                            >
                                                {rating <= 2 ? "We're sorry to hear that. We'll do better. 💜" :
                                                    rating === 3 ? "Thanks! We're always improving. 🌱" :
                                                        rating === 4 ? "Great to hear! We appreciate that. 🌟" :
                                                            "Wonderful! That means the world to us! 🎉"}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Text Feedback */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Tell us more (optional)
                                        </label>
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="What did you like? What can we improve?"
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none"
                                        />
                                    </div>

                                    {/* Optional Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email (optional)
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@university.edu"
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            Only if you'd like us to follow up with you.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={rating === 0 || isSubmitting}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Feedback
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link
                                        to="/chat"
                                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-500 transition-colors"
                                    >
                                        <ArrowLeft size={14} />
                                        Back to chat
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Feedback;
