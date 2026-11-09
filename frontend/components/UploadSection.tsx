"use client";

import { useState } from "react";

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

// A message box: attach the chat, press send.
export default function UploadSection({ file, loading, error, selectFile, handleAnalyze }: UploadSectionProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
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
        className={`group flex min-h-56 flex-col items-center justify-center rounded-[2rem] border-[3px] border-dashed px-6 py-10 text-center transition-[background-color,border-color,transform] duration-200 has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-accent-text ${
          loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${dragging ? "scale-[1.02] border-accent bg-accent/15" : "border-ink/25 hover:border-ink/60"}`}
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
            <span className="say max-w-full text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] [overflow-wrap:anywhere]">
              {file.name}
            </span>
            <span className="mt-2 text-lg text-muted tabular">{formatSize(file.size)} · this should be interesting</span>
            <span className="text-link mt-4 text-lg">pick a different file</span>
          </>
        ) : (
          <>
            <span className="say text-[clamp(1.75rem,1.3rem+1.8vw,2.75rem)] transition-transform duration-300 group-hover:-rotate-1">
              {dragging ? "let go. we’ve got it." : "drop the chat here"}
            </span>
            <span className="mt-2 text-lg text-muted">or click to pick the .txt file</span>
          </>
        )}
      </label>

      <p id="chat-file-hint" className="mt-3 text-base text-muted">
        a WhatsApp or copied Instagram .txt export, up to 10 MiB.
      </p>

      {error && (
        <p
          id="upload-error"
          role="alert"
          className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-lg font-medium text-danger motion-safe:animate-[pop-in_300ms_var(--ease-out)]"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="send send-accent min-w-40 text-lg"
        >
          {loading ? "sending…" : "send"}
        </button>
        <p className="max-w-[46ch] text-base text-muted">
          names, stats and some messages go to OpenAI for the ai&rsquo;s take, so make sure the
          chat is fine with that.
        </p>
      </div>
    </div>
  );
}
