/**
 * Chat Store – Zustand
 * Manages chat sessions, messages, and emotion detection state.
 * Architecture note: all AI communication is routed through emoticaService.js
 */
import { create } from 'zustand';
import { sendMessage, detectEmotion, resetConversation } from '../services/emoticaService';

const createNewChat = () => ({
    id: 'chat_' + Date.now(),
    title: 'New Conversation',
    messages: [],
    createdAt: new Date().toISOString(),
});

const useChatStore = create((set, get) => ({
    chats: [],
    activeChatId: null,
    currentEmotion: null,
    isTyping: false,
    error: null,

    /** Get the currently active chat object */
    getActiveChat: () => {
        const { chats, activeChatId } = get();
        return chats.find((c) => c.id === activeChatId) || null;
    },

    /** Start a new chat session */
    createNewChat: () => {
        const chat = createNewChat();
        resetConversation(); // Clear Ollama conversation history
        set((state) => ({
            chats: [chat, ...state.chats],
            activeChatId: chat.id,
            currentEmotion: null,
            error: null,
        }));
        return chat.id;
    },

    /** Switch to an existing chat */
    setActiveChat: (chatId) => {
        resetConversation(); // Reset API history when switching chats
        set({ activeChatId: chatId, error: null });
    },

    /** Delete a chat */
    deleteChat: (chatId) => {
        set((state) => {
            const filtered = state.chats.filter((c) => c.id !== chatId);
            return {
                chats: filtered,
                activeChatId: state.activeChatId === chatId
                    ? (filtered[0]?.id || null)
                    : state.activeChatId,
            };
        });
    },

    /**
     * Send a user message and get an AI response.
     * @param {string} text  – the user's message
     * @param {File|null} image – optional uploaded image
     */
    sendMessage: async (text, image = null) => {
        const { activeChatId, chats } = get();
        if (!activeChatId) return;

        // Create user message
        const userMsg = {
            id: 'msg_' + Date.now(),
            role: 'user',
            content: text,
            image: image ? URL.createObjectURL(image) : null,
            timestamp: new Date().toISOString(),
        };

        // Add user message to chat
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === activeChatId
                    ? {
                        ...c,
                        messages: [...c.messages, userMsg],
                        title: c.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? '...' : '') : c.title,
                    }
                    : c
            ),
            isTyping: true,
            error: null,
        }));

        try {
            // Detect emotion from user text
            const emotion = await detectEmotion(text);
            set({ currentEmotion: emotion });

            // Get AI response from Ollama
            const aiResponse = await sendMessage(text, image);

            const aiMsg = {
                id: 'msg_' + Date.now(),
                role: 'assistant',
                content: aiResponse.text,
                emotion: emotion,
                timestamp: new Date().toISOString(),
            };

            set((state) => ({
                chats: state.chats.map((c) =>
                    c.id === activeChatId
                        ? { ...c, messages: [...c.messages, aiMsg] }
                        : c
                ),
                isTyping: false,
            }));
        } catch (err) {
            set({ error: 'Something went wrong. Please try again.', isTyping: false });
        }
    },
}));

export default useChatStore;
