import type {
  ChatRequest,
  ChatResponse,
  SuggestionsRequest,
  SuggestionsResponse,
  UploadResponse,
} from "../types/api";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse<UploadResponse>(response);
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<ChatResponse>(response);
}

export async function fetchSuggestions(
  payload: SuggestionsRequest,
): Promise<SuggestionsResponse> {
  const response = await fetch("/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<SuggestionsResponse>(response);
}
