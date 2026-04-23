"use client";

import { useId, useState } from "react";
import type { Suggestion } from "../../types/suggestion";
import { Loader } from "../shared/Loader";

interface SuggestionsProps {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  onClickSuggestion: (question: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function Suggestions({
  suggestions,
  loading,
  error,
  onClickSuggestion,
  onRefresh,
  disabled = false,
}: SuggestionsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const contentId = useId();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Suggested Questions</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={loading || disabled}
            className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!collapsed}
            aria-controls={contentId}
            className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>

      <div id={contentId} className={`mt-3 ${collapsed ? "hidden" : "min-h-8"}`}>
        {loading ? <Loader label="Generating suggestions..." /> : null}
        {!loading && error ? <p className="text-xs text-rose-600">{error}</p> : null}
        {!loading && !error && suggestions.length === 0 ? (
          <p className="text-xs text-slate-500">Suggestions appear after upload.</p>
        ) : null}
        {!loading && !error && suggestions.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => void onClickSuggestion(suggestion.question)}
                  disabled={disabled}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  {suggestion.question}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
