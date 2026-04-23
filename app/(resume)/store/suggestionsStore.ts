"use client";

import { create } from "zustand";
import { fetchSuggestions } from "../lib/api";
import { useResumeStore } from "./resumeStore";
import type { Resume } from "../types/resume";
import type { Suggestion } from "../types/suggestion";

interface SuggestionsState {
  items: Suggestion[];
  loading: boolean;
  error: string | null;
  fetchForResume: (resume: Resume) => Promise<void>;
  refreshFromStoredResume: () => Promise<void>;
  clear: () => void;
}

export const useSuggestionsStore = create<SuggestionsState>((set) => ({
  items: [],
  loading: false,
  error: null,
  fetchForResume: async (resume) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSuggestions({ resume });
      set({ items: data.suggestions, loading: false });
    } catch {
      set({ error: "Could not load suggestions.", loading: false });
    }
  },
  refreshFromStoredResume: async () => {
    const currentResume = useResumeStore.getState().resume;
    if (!currentResume) {
      set({ items: [], loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await fetchSuggestions({ resume: currentResume });
      set({ items: data.suggestions, loading: false });
    } catch {
      set({ error: "Could not load suggestions.", loading: false });
    }
  },
  clear: () => set({ items: [], loading: false, error: null }),
}));
