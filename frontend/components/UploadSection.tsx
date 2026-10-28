"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, Sparkles, UploadCloud } from "lucide-react";

type UploadSectionProps = {
  file: File | null;
  loading: boolean;
  error: string;
  selectFile: (file: File | null) => void;
  handleAnalyze: () => void;
};

export default function UploadSection({
  file,
  loading,
  error,
  selectFile,
  handleAnalyze,
}: UploadSectionProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <>
      {/* UPLOAD */}
      <motion.div
        initial={{
          opacity: 0,
          rotate: 2,
          y: 25,
        }}
        animate={{
          opacity: 1,
          rotate: -1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 0.15,
        }}
        className="relative"
      >
        <div className="absolute -right-4 -top-5 rotate-6 bg-yellow-400 px-4 py-2 text-sm font-bold text-[#0b132b] shadow-xl">
          feed me the lore
        </div>

        <div className="rounded-xl border-2 border-[#344363] bg-[#131b33] p-5 shadow-2xl">
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
            className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-8 text-center transition ${
              dragging
                ? "border-yellow-400 bg-yellow-400/10"
                : "border-[#435273] bg-[#0f172a]/60 hover:border-yellow-400"
            }`}
          >
            <input
              id="chat-file"
              type="file"
              accept=".txt"
              className="hidden"
              onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            />

            <UploadCloud size={38} className="mb-5 text-yellow-400" />

            {file ? (
              <>
                <p className="text-lg font-bold">{file.name}</p>

                <p className="mt-2 text-sm text-[#7d8aa6]">
                  this should be interesting
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold">drop your chat here</p>

                <p className="mt-2 text-sm text-[#7d8aa6]">
                  or click this suspiciously large box
                </p>

                <p className="mt-1 text-xs text-[#56627c]">
                  whatsapp or copied instagram .txt export
                </p>
              </>
            )}
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[#344363] bg-[#0f172a]/50 p-4">
              <p className="text-sm font-bold text-yellow-400">whatsapp</p>

              <p className="mt-1 text-xs leading-5 text-[#7d8aa6]">
                export the chat without media and upload the .txt file
              </p>
            </div>

            <div className="rounded-lg border border-[#344363] bg-[#0f172a]/50 p-4">
              <p className="text-sm font-bold text-yellow-400">instagram</p>

              <p className="mt-1 text-xs leading-5 text-[#7d8aa6]">
                open your downloaded conversation, copy the chat into a .txt
                file, then upload it here
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={handleAnalyze}
            disabled={loading || !file}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 py-4 font-bold text-[#0b132b] shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={19} />
                overanalyzing...
              </>
            ) : (
              <>
                analyze my questionable decisions
                <Sparkles size={17} />
              </>
            )}
          </motion.button>
          <p className="mt-4 text-center text-xs leading-5 text-[#94a3b8]">
            heads up: we send participant names, chat stats, and selected
            message excerpts to OpenAI for the overthinking. make sure everyone
            involved is okay with that. the AI has opinions, not a psychology
            degree 😅
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </motion.div>
    </>
  );
}
