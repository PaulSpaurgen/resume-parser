import type { ChatMessage } from "../../types/chat";
import { ChatBubble } from "../shared/ChatBubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        Ask a question to start the conversation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
