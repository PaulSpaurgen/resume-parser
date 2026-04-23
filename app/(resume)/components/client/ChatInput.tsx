"use client";

import { useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  disabled?: boolean;
  onSend: (value: string) => Promise<void>;
}

export function ChatInput({ disabled = false, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = async (): Promise<void> => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }

    setValue("");
    await onSend(trimmed);
  };

  const onKeyDown = async (event: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (event.key === "Enter") {
      event.preventDefault();
      await submit();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => void onKeyDown(event)}
        placeholder="Ask about strengths, gaps, or role fit..."
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-700 disabled:placeholder:text-slate-500 disabled:opacity-100"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => void submit()}
        disabled={disabled || value.trim().length === 0}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
