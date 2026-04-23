"use client";

import type { ChatMessage } from "../../types/chat";
import { FlagButton } from "./FlagButton";
import { ChatBubble } from "../shared/ChatBubble";
import { Loader } from "../shared/Loader";

interface ChatFeedProps {
  messages: ChatMessage[];
  loading: boolean;
  isFlagged: (messageId: string) => boolean;
  onToggleFlag: (messageId: string) => void;
}

export function ChatFeed({
  messages,
  loading,
  isFlagged,
  onToggleFlag,
}: ChatFeedProps) {
  return (
    <div className="mt-4 h-full space-y-3 overflow-y-auto pr-1">
      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Start by uploading a resume, then ask your first question.
        </div>
      ) : null}
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
          actionSlot={
            message.role === "assistant" ? (
              <FlagButton
                flagged={isFlagged(message.id)}
                onToggle={() => onToggleFlag(message.id)}
              />
            ) : undefined
          }
        />
      ))}
      {loading ? <Loader label="Thinking through the resume..." /> : null}
    </div>
  );
}
