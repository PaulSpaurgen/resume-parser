"use client";

import type { ReactNode } from "react";
import type { ChatMessage } from "../../types/chat";

interface ChatBubbleProps {
  message: ChatMessage;
  actionSlot?: ReactNode;
}

export function ChatBubble({ message, actionSlot }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`max-w-[90%] rounded-2xl p-3 text-sm md:max-w-[80%] ${
          isUser ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-900"
        }`}
      >
        <p className="leading-relaxed">{message.content}</p>
        {message.citations && message.citations.length > 0 ? (
          <p className="mt-2 text-xs opacity-80">Sources: {message.citations.map((item) => item.label).join(" | ")}</p>
        ) : null}
        {actionSlot ? <div className="mt-2">{actionSlot}</div> : null}
      </article>
    </div>
  );
}
