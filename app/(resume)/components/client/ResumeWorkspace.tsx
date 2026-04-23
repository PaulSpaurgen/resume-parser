"use client";

import { useEffect, useMemo } from "react";
import { useChat } from "../../hooks/useChat";
import { useSuggestionsStore } from "../../store/suggestionsStore";
import { ChatPanel } from "./ChatPanel";
import { ResumeSidebar } from "./ResumeSidebar";
import FlaggedList from "../server/FlaggedList";

export function ResumeWorkspace() {
  const { messages, flaggedIds, loading, error, sendMessage, toggleFlag, isFlagged, clearChat } =
    useChat();

  const flaggedMessages = useMemo(
    () => messages.filter((message) => flaggedIds.includes(message.id)),
    [messages, flaggedIds],
  );

  

  const handleResumeUploaded = () => {
    clearChat();
  };

  return (
    <main className="mx-auto min-h-screen w-full  bg-slate-50 p-4 md:p-6">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_2fr_1fr]">
        <ResumeSidebar onResumeUploaded={handleResumeUploaded} />

        <ChatPanel
          chat={{
            messages,
            loading,
            error,
          }}
          actions={{
            onSendMessage: sendMessage,
            isFlagged,
            onToggleFlag: toggleFlag,
          }}
        />

        <FlaggedList flaggedMessages={flaggedMessages} />
      </div>
    </main>
  );
}
