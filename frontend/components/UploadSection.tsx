"use client";

import { useState } from "react";
import { FileText, LoaderCircle, UploadCloud } from "lucide-react";

type UploadSectionProps = {
  file: File | null;
  loading: boolean;
  error: string;
  selectFile: (file: File | null) => void;
  handleAnalyze: () => void;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadSection({
  file,
  loading,
  error,
  selectFile,
  handleAnalyze,
}: UploadSectionProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="card p-4 sm:p-6">
      <label
        htmlFor="chat-file"
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);

          selectFile(event.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex min-h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-accent ${
          loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${
          dragging
            ? "border-accent bg-accent/10"
            : "border-line bg-bg/40 hover:border-accent/70"
        }`}
      >
        {/* Visually hidden, not display:none, so the native input stays
            in the tab order and Enter/Space open the file picker. */}
        <input
          id="chat-file"
          type="file"
          accept=".txt"
          disabled={loading}
          aria-describedby={error ? "chat-file-hint upload-error" : "chat-file-hint"}
          className="sr-only"
          onChange={(event) => {
            selectFile(event.target.files?.[0] ?? null);

            // Allow choosing the same file again after an error.
            event.target.value = "";
          }}
        />

        {file ? (
          <>
            <FileText size={32} className="mb-3 text-accent" aria-hidden="true" />
            <span className="max-w-full font-semibold [overflow-wrap:anywhere]">
              {file.name}
            </span>
            <span className="mt-1 text-sm text-muted tabular-nums">
              {formatSize(file.size)} · this should be interesting
            </span>
            <span className="mt-3 text-sm text-accent underline underline-offset-4">
              choose a different file
            </span>
          </>
        ) : (
          <>
            <UploadCloud size={32} className="mb-3 text-accent" aria-hidden="true" />
            <span className="font-semibold">drop your chat here</span>
            <span className="mt-1 text-sm text-muted">
              or click to choose a file
            </span>
          </>
        )}
      </label>

      <p id="chat-file-hint" className="mt-3 text-sm text-muted">
        A WhatsApp or copied Instagram .txt export, up to 10 MiB.
      </p>

      {error && (
        <p
          id="upload-error"
          role="alert"
          className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="btn-primary mt-5 w-full"
      >
        {loading ? (
          <>
            <LoaderCircle
              className="motion-safe:animate-spin"
              size={18}
              aria-hidden="true"
            />
            overanalyzing…
          </>
        ) : (
          "analyze my questionable decisions"
        )}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Heads up: we send participant names, chat stats, and selected message
        excerpts to OpenAI for the overthinking. Make sure everyone involved is
        okay with that. The AI has opinions, not a psychology degree.
      </p>
    </div>
  );
}
