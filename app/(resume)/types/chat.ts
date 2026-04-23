export type ChatRole = "user" | "assistant";

export interface ChatCitation {
  id: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  citations?: ChatCitation[];
}
