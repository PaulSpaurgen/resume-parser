"use client";

import { useMemo, useState } from "react";
import { sendChatMessage } from "../lib/api";
import {
  initialChatStoreState,
  toggleFlaggedMessage,
  type ChatStoreState,
} from "../store/chatStore";
import type { ChatMessage } from "../types/chat";
import { useResumeStore } from "../store/resumeStore";

interface UseChatResult {
  messages: ChatMessage[];
  flaggedIds: string[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  toggleFlag: (messageId: string) => void;
  isFlagged: (messageId: string) => boolean;
  clearChat: () => void;
}

function createUserMessage(content: string): ChatMessage {
  return {
    id: `user-${crypto.randomUUID()}`,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function useChat(): UseChatResult {
  const [store, setStore] = useState<ChatStoreState>({
    ...initialChatStoreState,
    messages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resume = useResumeStore((state) => state.resume);

  
  const sendMessage = async (content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage = createUserMessage(trimmed);
    const nextHistory = [...store.messages, userMessage];
    setStore((prev) => ({ ...prev, messages: nextHistory }));
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage({ message: trimmed, resume: resume!, history: nextHistory });
      setStore((prev) => ({ ...prev, messages: [...prev.messages, response.reply] }));
    } catch {
      setError("Assistant response failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (messageId: string): void => {
    setStore((prev) => ({
      ...prev,
      flaggedMessageIds: toggleFlaggedMessage(prev.flaggedMessageIds, messageId),
    }));
  };

  const isFlagged = useMemo(
    () => (messageId: string) => store.flaggedMessageIds.includes(messageId),
    [store.flaggedMessageIds],
  );

  const clearChat = () => {
    setStore((prev) => ({ ...prev, messages: [] }));
  };

  return {
    messages: store.messages,
    flaggedIds: store.flaggedMessageIds,
    loading,
    error,
    sendMessage,
    toggleFlag,
    isFlagged,
    clearChat,
  };
}
