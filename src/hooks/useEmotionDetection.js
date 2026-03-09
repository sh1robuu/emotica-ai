/**
 * useEmotionDetection Hook
 * Provides mock emotion detection from text input.
 * Replace the service call in emoticaService.js to use a real model.
 */
import { useState, useCallback } from 'react';
import { detectEmotion } from '../services/emoticaService';

const useEmotionDetection = () => {
    const [emotion, setEmotion] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const detect = useCallback(async (text) => {
        if (!text.trim()) return null;
        setIsDetecting(true);
        try {
            const result = await detectEmotion(text);
            setEmotion(result);
            return result;
        } catch {
            return null;
        } finally {
            setIsDetecting(false);
        }
    }, []);

    const reset = useCallback(() => setEmotion(null), []);

    return { emotion, isDetecting, detect, reset };
};

export default useEmotionDetection;
