import type { ChatMessage } from "../types/chat";

export interface ChatStoreState {
  messages: ChatMessage[];
  flaggedMessageIds: string[];
}

export const initialChatStoreState: ChatStoreState = {
  messages: [],
  flaggedMessageIds: [],
};

export function toggleFlaggedMessage(
  flaggedMessageIds: string[],
  messageId: string,
): string[] {
  return flaggedMessageIds.includes(messageId)
    ? flaggedMessageIds.filter((id) => id !== messageId)
    : [...flaggedMessageIds, messageId];
}
