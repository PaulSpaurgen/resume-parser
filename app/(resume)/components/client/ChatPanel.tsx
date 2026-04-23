"use client";

import type { ChatMessage } from "../../types/chat";
import { ChatInput } from "./ChatInput";
import { ChatFeed } from "./ChatFeed";
import { Suggestions } from "./Suggestions";
import { useSuggestionsStore } from "../../store/suggestionsStore";
import { useResumeStore } from "../../store/resumeStore";

interface ChatPanelProps {
  chat: {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
  };
  actions: {
    onSendMessage: (content: string) => Promise<void>;
    isFlagged: (messageId: string) => boolean;
    onToggleFlag: (messageId: string) => void;
  };
}

export function ChatPanel({ chat, actions }: ChatPanelProps) {
  const resume = useResumeStore((state) => state.resume);
  const suggestions = useSuggestionsStore((state) => state.items);
  const suggestionsLoading = useSuggestionsStore((state) => state.loading);
  const suggestionsError = useSuggestionsStore((state) => state.error);
  const refreshFromStoredResume = useSuggestionsStore(
    (state) => state.refreshFromStoredResume,
  );
  const canChat = Boolean(resume);

  return (
    <section className="flex h-[calc(100vh-50px)] flex-col rounded-2xl border border-slate-200 bg-white p-4">
      <h1 className="text-xl font-semibold text-slate-900">Resume AI Assistant</h1>
      <p className="mt-1 text-sm text-slate-600">
        Ask questions about candidate fit, strengths, gaps, and timeline risks.
      </p>

      <div className="mt-4">
        <Suggestions
          suggestions={suggestions}
          loading={suggestionsLoading}
          error={suggestionsError}
          onClickSuggestion={actions.onSendMessage}
          onRefresh={refreshFromStoredResume}
          disabled={chat.loading || !canChat}
        />
      </div>

      <div className="min-h-0 flex-1">
        <ChatFeed
          messages={chat.messages}
          loading={chat.loading}
          isFlagged={actions.isFlagged}
          onToggleFlag={actions.onToggleFlag}
        />
      </div>

      <div className="mt-4">
        <ChatInput onSend={actions.onSendMessage} disabled={chat.loading || !canChat} />
        {chat.error ? <p className="mt-2 text-xs text-rose-600">{chat.error}</p> : null}
      </div>
    </section>
  );
}
