import { FileQuestion } from "lucide-react";

const stepClass =
  "space-y-3 pl-5 list-decimal text-sm leading-6 text-[#b6c0d3]";

export default function ExportGuide() {
  return (
    <section
      id="export-guide"
      aria-labelledby="export-guide-title"
      className="mx-auto max-w-7xl scroll-mt-8 px-6 pb-20 lg:px-10"
    >
      <div className="rounded-xl border border-[#344363] bg-[#111b30] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <FileQuestion
            size={26}
            className="mt-1 shrink-0 text-yellow-400"
            aria-hidden="true"
          />

          <div>
            <h2
              id="export-guide-title"
              className="text-2xl font-black sm:text-3xl"
            >
              wait, how do i get the chat?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
              fair question. choose your platform below. we need the text file,
              not 400 screenshots of the conversation.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <details className="group rounded-lg border border-[#344363] bg-[#17213b]">
            <summary className="cursor-pointer rounded-lg px-5 py-5 font-bold text-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400">
              whatsapp · iphone
            </summary>

            <div className="px-5 pb-6">
              <ol className={stepClass}>
                <li>Open the conversation in WhatsApp on your phone.</li>
                <li>
                  Tap the contact or group name at the top, then find{" "}
                  <strong className="text-white">Export Chat</strong>.
                </li>
                <li>
                  Choose <strong className="text-white">Without Media</strong>.
                  we&apos;re reading the lore, not watching the videos.
                </li>
                <li>
                  Save the export to Files, or transfer it to the device where
                  you&apos;re using TalkTracker.
                </li>
                <li>
                  If you received a ZIP, extract it first. Upload the{" "}
                  <code className="text-yellow-400">.txt</code> file inside,
                  often named <code className="text-yellow-400">_chat.txt</code>
                  .
                </li>
              </ol>
            </div>
          </details>

          <details className="rounded-lg border border-[#344363] bg-[#17213b]">
            <summary className="cursor-pointer rounded-lg px-5 py-5 font-bold text-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400">
              whatsapp · android
            </summary>

            <div className="px-5 pb-6">
              <ol className={stepClass}>
                <li>Open the conversation in WhatsApp on your phone.</li>
                <li>
                  Open the three-dot menu, then choose{" "}
                  <strong className="text-white">More → Export chat</strong>.
                </li>
                <li>
                  Choose <strong className="text-white">Without media</strong>.
                </li>
                <li>
                  Save or share the export to the device where you&apos;re using
                  TalkTracker.
                </li>
                <li>
                  Upload the <code className="text-yellow-400">.txt</code> file.
                  If it came inside a ZIP, extract it first.
                </li>
              </ol>
            </div>
          </details>

          <details className="rounded-lg border border-[#344363] bg-[#17213b]">
            <summary className="cursor-pointer rounded-lg px-5 py-5 font-bold text-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400">
              instagram · a few extra steps, unfortunately
            </summary>

            <div className="space-y-5 px-5 pb-6">
              <p className="text-sm leading-6 text-[#b6c0d3]">
                Instagram support currently works with text copied from a
                downloaded conversation. Raw JSON, HTML, and ZIP files
                aren&apos;t accepted directly.
              </p>

              <ol className={stepClass}>
                <li>
                  Use Instagram&apos;s information export tool to request your
                  messages. Follow the{" "}
                  <a
                    href="https://help.instagram.com/181231772500920"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-yellow-400 underline underline-offset-4"
                  >
                    official export instructions
                  </a>
                  . Choose HTML if you want to open the downloaded conversation
                  in a browser.
                </li>
                <li>
                  Once the download is ready, extract it and open the
                  conversation you want to analyze.
                </li>
                <li>
                  Copy the conversation content into a plain-text editor such as
                  Notepad. Preserve the sender names, messages, timestamps, and
                  line breaks.
                </li>
                <li>
                  Check that the copied text follows the layout below. The very
                  first line must be a sender&apos;s name. Delete any page
                  title, navigation, or headings above it, or they&apos;ll show
                  up as a mystery extra participant.
                </li>
                <li>
                  Save it as a UTF-8{" "}
                  <code className="text-yellow-400">.txt</code> file and upload
                  it here.
                </li>
              </ol>

              <div>
                <p className="mb-3 text-xs font-semibold text-[#94a3b8]">
                  expected layout · fictional example
                </p>

                <pre className="overflow-x-auto rounded-lg border border-[#344363] bg-[#0a1020] p-4 text-xs leading-6 text-[#d1d8e5]">
                  {`Alex
hello
Dec 15, 2025 3:07 pm
Sam
deeply insightful
Dec 15, 2025 3:06 pm`}
                </pre>
              </div>

              <p className="text-xs leading-6 text-[#94a3b8]">
                Export layouts can vary. If yours doesn&apos;t copy into this
                structure, it may not work with the current parser. Renaming a
                .json or .html file to .txt won&apos;t convert it.
              </p>
            </div>
          </details>
        </div>

        <div className="mt-6 border-t border-[#344363] pt-5 text-xs leading-6 text-[#94a3b8]">
          <p>
            Files must be under 10 MiB. Only upload conversations you have
            permission to share. AI analysis sends participant names,
            statistics, and selected message excerpts to OpenAI.
          </p>

          <p className="mt-2">
            The parser understands English-language exports. System messages
            and media placeholders in other languages may sneak into the word
            counts. Group chats work, but nobody can tell from an export who
            was replying to whom, so reply stats become “gap before jumping in”.
          </p>

          <a
            href="https://faq.whatsapp.com/1180414079177245/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-yellow-400 underline underline-offset-4"
          >
            WhatsApp&apos;s official export guide
          </a>
        </div>
      </div>
    </section>
  );
}
