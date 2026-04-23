"use client";

interface FlagButtonProps {
  flagged: boolean;
  onToggle: () => void;
}

export function FlagButton({ flagged, onToggle }: FlagButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
        flagged
          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
      aria-pressed={flagged}
    >
      {flagged ? "Flagged" : "Flag"}
    </button>
  );
}
