/**
 * Emotica AI Service Layer
 * ========================
 * Connects to the Ollama API for LLM-powered therapeutic responses.
 * Emotion detection uses keyword matching (client-side).
 * Vision & RAG are still mock – replace when backend is ready.
 *
 * Config loaded from .env via Vite (VITE_ prefix):
 *   VITE_OLLAMA_BASE_URL, VITE_OLLAMA_API_KEY,
 *   VITE_LLM_MODEL, VITE_LLM_TEMPERATURE, VITE_LLM_MAX_TOKENS
 */

// ============================
// Ollama API Config (loaded from .env via Vite)
// ============================
const OLLAMA_API_KEY = import.meta.env.VITE_OLLAMA_API_KEY || '';
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL || 'ministral-3:14b-cloud';
const LLM_TEMPERATURE = parseFloat(import.meta.env.VITE_LLM_TEMPERATURE || '0.3');
const LLM_MAX_TOKENS = parseInt(import.meta.env.VITE_LLM_MAX_TOKENS || '1800', 10);

// System prompt that makes the AI behave as a therapeutic companion
const SYSTEM_PROMPT = `You are Emotica AI, a compassionate and empathetic AI therapy companion designed specifically for students. Your role is to:

1. Listen actively and validate the student's feelings without judgment.
2. Respond with warmth, empathy, and emotional intelligence.
3. Use supportive language and gentle encouragement.
4. If the student seems to be in severe distress (mentions self-harm, suicide, or extreme hopelessness), gently suggest they reach out to a trusted adult, school counselor, or crisis helpline (988 Suicide & Crisis Lifeline, or text HOME to 741741).
5. Never diagnose, prescribe, or replace professional mental health support.
6. Keep responses concise but caring — 2 to 4 sentences is ideal unless deeper discussion is needed.
7. Use occasional emojis (💜🌱🌸) to keep the tone warm and approachable.
8. Remember: you are speaking to students — be age-appropriate, relatable, and kind.

You are NOT a doctor, therapist, or counselor. You are a supportive AI friend.`;

// ============================
// Emotion Detection (client-side keyword matching)
// ============================
const emotionKeywords = {
    anxious: ['anxious', 'anxiety', 'worried', 'nervous', 'panic', 'fear', 'scared', 'overthinking'],
    stressed: ['stressed', 'stress', 'overwhelmed', 'pressure', 'exhausted', 'burnout', 'tired', 'deadline'],
    sad: ['sad', 'depressed', 'lonely', 'hopeless', 'crying', 'hurt', 'grief', 'loss', 'miss'],
    angry: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'furious', 'rage'],
    happy: ['happy', 'great', 'wonderful', 'amazing', 'excited', 'joyful', 'good', 'fantastic', 'love'],
    confused: ['confused', 'lost', 'uncertain', 'unsure', "don't know", 'stuck'],
    distressed: ['suicide', 'kill myself', 'end it', 'self-harm', 'no point', 'give up', "can't go on"],
};

const getEmotionColor = (emotion) => {
    const colors = {
        anxious: '#fbbf24',
        stressed: '#f97316',
        sad: '#60a5fa',
        angry: '#ef4444',
        happy: '#34d399',
        confused: '#a78bfa',
        distressed: '#ef4444',
    };
    return colors[emotion] || '#a78bfa';
};

/**
 * Detect emotion from user text (client-side keyword matching).
 * @param {string} text
 * @returns {Promise<{label: string, severity: string, color: string}>}
 */
export const detectEmotion = async (text) => {
    const lower = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some((kw) => lower.includes(kw))) {
            return {
                label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
                severity: emotion === 'distressed' ? 'critical' : 'normal',
                color: getEmotionColor(emotion),
            };
        }
    }

    return { label: 'Neutral', severity: 'normal', color: '#a78bfa' };
};

// ============================
// Conversation history for context (kept in-memory per session)
// ============================
let conversationHistory = [];

/**
 * Reset conversation history (call when starting a new chat).
 */
export const resetConversation = () => {
    conversationHistory = [];
};

/**
 * Send a message to the Ollama API and get a real AI response.
 * Falls back to a default message if the API call fails.
 * @param {string} text  – the user's message
 * @param {File|null} image – optional image (noted in message, not sent to vision model yet)
 * @returns {Promise<{text: string, emotion: string}>}
 */
export const sendMessage = async (text, image = null) => {
    const emotion = await detectEmotion(text);

    // Build user message content
    let userContent = text;
    if (image) {
        userContent += '\n\n[The student also shared an image with this message.]';
    }

    // Add user message to history
    conversationHistory.push({ role: 'user', content: userContent });

    // Build messages array with system prompt + conversation history
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
    ];

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OLLAMA_API_KEY}`,
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages: messages,
                stream: false,
                options: {
                    temperature: LLM_TEMPERATURE,
                    num_predict: LLM_MAX_TOKENS,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Ollama API error:', response.status, errorBody);
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Extract assistant response – handle both Ollama formats
        let aiText = '';
        if (data.message?.content) {
            aiText = data.message.content;
        } else if (data.choices?.[0]?.message?.content) {
            // OpenAI-compatible format
            aiText = data.choices[0].message.content;
        } else if (typeof data.response === 'string') {
            aiText = data.response;
        } else {
            console.warn('Unexpected API response format:', data);
            aiText = "I'm here for you. Could you tell me a bit more about what's on your mind? 💜";
        }

        // Append crisis resources if severe distress detected
        if (emotion.severity === 'critical') {
            aiText += '\n\n🆘 **Crisis Text Line**: Text HOME to 741741\n📞 **988 Suicide & Crisis Lifeline**: Call or text 988';
        }

        // Store assistant response in history
        conversationHistory.push({ role: 'assistant', content: aiText });

        // Trim history to last 20 messages to avoid token overflow
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        return { text: aiText, emotion: emotion.label };
    } catch (err) {
        console.error('Failed to reach Ollama API:', err);

        // Fallback response so the UI never breaks
        const fallback =
            "I'm having a little trouble connecting right now, but I'm still here for you. " +
            "Could you try sending your message again? 💜";

        conversationHistory.push({ role: 'assistant', content: fallback });

        return { text: fallback, emotion: emotion.label };
    }
};

/**
 * Retrieve relevant knowledge for RAG context (mock).
 * Replace with your RAG pipeline API when ready.
 * @param {string} query
 * @returns {Promise<{context: string, sources: string[]}>}
 */
export const retrieveKnowledge = async (query) => {
    return {
        context:
            "Based on therapeutic best practices, it's important to validate feelings before offering solutions. " +
            'Active listening and empathetic responses are key to building trust.',
        sources: ['therapeutic-guidelines.pdf', 'student-wellness-handbook.pdf'],
    };
};

/**
 * Generate a caption for an uploaded image (mock).
 * Replace with your vision model API when ready.
 * @param {File} file
 * @returns {Promise<{caption: string}>}
 */
export const captionImage = async (file) => {
    return {
        caption: 'An image shared by the student expressing their current emotional state.',
    };
};
