/**
 * Chat History Storage
 * Manages chat messages in localStorage
 */

import { ChatMessage } from "./gemini";

const CHAT_STORAGE_KEY = "earnings_tracker_chat_history";

/**
 * Get chat history from localStorage
 */
export function getChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

/**
 * Save chat history to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
}

/**
 * Add a message to chat history
 */
export function addChatMessage(message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage {
  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...message,
  };

  const history = getChatHistory();
  const updatedHistory = [...history, newMessage];

  // Keep last 100 messages
  const trimmedHistory = updatedHistory.slice(-100);

  saveChatHistory(trimmedHistory);

  return newMessage;
}

/**
 * Clear chat history
 */
export function clearChatHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear chat history:", error);
  }
}
