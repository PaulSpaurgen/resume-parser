import type { ChatMessage } from "./chat";
import type { Resume } from "./resume";
import type { Suggestion } from "./suggestion";

export interface UploadResponse {
  resume: Resume;
}

export interface ChatRequest {
  message: string;
  resume: Resume;
  history: ChatMessage[];
}

export interface ChatResponse {
  reply: ChatMessage;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export interface SuggestionsRequest {
  resume: Resume;
}
