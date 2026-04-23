import type { ChatMessage } from "../../types/chat";

interface FlaggedListProps {
  flaggedMessages: ChatMessage[];
}

export default function FlaggedList({ flaggedMessages }: FlaggedListProps) {
  if (flaggedMessages.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Flagged Insights</h2>
        <p className="mt-2 text-sm text-slate-500">No insights flagged yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl h-[calc(100vh-50px)] overflow-y-auto border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Flagged Insights</h2>
      <ul className="mt-3 space-y-2">
        {flaggedMessages.map((message) => (
          <li key={message.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-slate-800">
            {message.content}
          </li>
        ))}
      </ul>
    </section>
  );
}
