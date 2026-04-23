"use client";

import { useState } from "react";
import { uploadResume } from "../lib/api";
import type { Resume } from "../types/resume";
import { useResumeStore } from "../store/resumeStore";

interface UseResumeUploadResult {
  resume: Resume | null;
  resumeLoading: boolean;
  resumeError: string | null;
  uploadAndParseResume: (file: File) => Promise<Resume | null>;
}

export function useResumeUpload(): UseResumeUploadResult {
  const resume = useResumeStore((state) => state.resume);
  const setResume = useResumeStore((state) => state.setResume);
  const clearResume = useResumeStore((state) => state.clearResume);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const uploadAndParseResume = async (file: File): Promise<Resume | null> => {
    setResumeLoading(true);
    setResumeError(null);

    try {
      const response = await uploadResume(file);
      setResume(response.resume);
      return response.resume;
    } catch {
      clearResume();
      setResumeError("Could not parse resume.");
      return null;
    } finally {
      setResumeLoading(false);
    }
  };

  return { resume, resumeLoading, resumeError, uploadAndParseResume };
}
