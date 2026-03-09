/**
 * Feedback Store – Zustand
 * Manages feedback form submissions (stored locally in state).
 * 
 * ADMIN NOTE: Feedback entries are stored in-memory.
 * To persist, connect to your backend API.
 */
import { create } from 'zustand';

const useFeedbackStore = create((set, get) => ({
    entries: [],
    isSubmitting: false,
    isSubmitted: false,

    submitFeedback: async ({ rating, text, email }) => {
        set({ isSubmitting: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const entry = {
            id: 'fb_' + Date.now(),
            rating,
            text,
            email: email || null,
            timestamp: new Date().toISOString(),
        };

        set((state) => ({
            entries: [...state.entries, entry],
            isSubmitting: false,
            isSubmitted: true,
        }));
    },

    resetForm: () => set({ isSubmitted: false }),

    /** Developer utility – get all feedback entries */
    getAllFeedback: () => get().entries,
}));

export default useFeedbackStore;
