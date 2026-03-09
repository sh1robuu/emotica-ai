/**
 * useChat Hook
 * Provides chat functionality with auto-scroll and loading state.
 */
import { useRef, useEffect, useCallback } from 'react';
import useChatStore from '../store/chatStore';

const useChat = () => {
    const messagesEndRef = useRef(null);

    const {
        chats,
        activeChatId,
        currentEmotion,
        isTyping,
        error,
        getActiveChat,
        createNewChat,
        setActiveChat,
        deleteChat,
        sendMessage,
    } = useChatStore();

    const activeChat = getActiveChat();
    const messages = activeChat?.messages || [];

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Ensure there's always an active chat
    const ensureActiveChat = useCallback(() => {
        if (!activeChatId || chats.length === 0) {
            return createNewChat();
        }
        return activeChatId;
    }, [activeChatId, chats.length, createNewChat]);

    const handleSend = useCallback(
        async (text, image = null) => {
            if (!text.trim() && !image) return;
            ensureActiveChat();
            await sendMessage(text, image);
        },
        [ensureActiveChat, sendMessage]
    );

    return {
        chats,
        activeChat,
        activeChatId,
        messages,
        currentEmotion,
        isTyping,
        error,
        messagesEndRef,
        createNewChat,
        setActiveChat,
        deleteChat,
        sendMessage: handleSend,
        ensureActiveChat,
    };
};

export default useChat;
