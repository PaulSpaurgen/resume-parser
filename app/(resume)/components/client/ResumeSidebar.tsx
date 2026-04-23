"use client";

import { useResumeUpload } from "../../hooks/useResumeUpload";
import { useSuggestionsStore } from "../../store/suggestionsStore";
import ResumeView from "../server/ResumeView";
import { Loader } from "../shared/Loader";
import { UploadInput } from "./UploadInput";

export function ResumeSidebar({onResumeUploaded}: {onResumeUploaded: () => void}) {
  const { resume, resumeLoading, resumeError, uploadAndParseResume } = useResumeUpload();
  const refresh = useSuggestionsStore((state) => state.fetchForResume);

  const handleUpload = async (file: File): Promise<void> => {
    const parsedResume = await uploadAndParseResume(file);
    onResumeUploaded();
    if (parsedResume) {
      await refresh(parsedResume);
    }
  };

  return (
    <section className="space-y-4 h-[calc(100vh-50px)] overflow-y-auto">
      <UploadInput onUpload={handleUpload} />
      {resumeLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <Loader label="Preparing structured resume..." />
        </div>
      ) : null}
      {resumeError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {resumeError}
        </div>
      ) : null}
      <ResumeView resume={resume} />
    </section>
  );
}
