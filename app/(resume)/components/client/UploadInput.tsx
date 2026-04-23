"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader } from "../shared/Loader";

interface UploadInputProps {
  onUpload: (file: File) => Promise<void>;
}

export function UploadInput({ onUpload }: UploadInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file chosen");

  const handleChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setSelectedFileName("No file chosen");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <label className="block text-sm font-semibold text-slate-900" htmlFor="resume-upload">
        Upload Resume (PDF)
      </label>
      <p className="mt-1 text-xs text-slate-500">UI-only mock upload for prototype flow.</p>
      <input
        ref={inputRef}
        id="resume-upload"
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="sr-only"
      />
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Choose PDF
        </button>
        <span className="truncate text-sm text-slate-700">{selectedFileName}</span>
      </div>
      <div className="mt-3 min-h-5">
        {uploading ? <Loader label="Uploading and parsing..." /> : null}
        {!uploading && error ? <p className="text-xs text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}
