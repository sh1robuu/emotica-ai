/**
 * Crisis Disclaimer Banner
 * Shown when severe emotional distress is detected.
 * Provides helpline information and encourages seeking help.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const CrisisDisclaimer = ({ show = false }) => {
    const [dismissed, setDismissed] = useState(false);

    return (
        <AnimatePresence>
            {show && !dismissed && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-b border-red-200 dark:border-red-800 px-4 py-3">
                        <div className="flex items-start gap-3 max-w-4xl mx-auto">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 text-sm">
                                <p className="font-semibold text-red-700 dark:text-red-300 mb-1">
                                    We care about your safety
                                </p>
                                <p className="text-red-600 dark:text-red-400 mb-2">
                                    If you or someone you know is in crisis, please reach out to a trusted adult or contact:
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-300 font-medium">
                                        <Phone size={14} /> 988 Suicide & Crisis Lifeline
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-300 font-medium">
                                        <MessageCircle size={14} /> Text HOME to 741741
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setDismissed(true)}
                                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CrisisDisclaimer;
