# talktracker

### who's actually carrying the chat?

A deeply unnecessary analysis of your texts.

Upload a WhatsApp or copied Instagram conversation and find out who yaps more, replies faster, starts everything, and keeps the conversation alive. Then let a language model decide who’s funnier, because apparently we needed outside arbitration.

[Open the app](https://real-talk-tracker.vercel.app)

## the damage report

- **Head to head:** message counts, word counts, message shares, and average message length.
- **Texting habits:** median reply gaps, conversation starts, and consecutive messages (double texts).
- **Chat awards:** biggest yapper, fastest responder, conversation starter, and other achievements unlikely to impress an employer.
- **Activity charts:** messages by hour, weekday, and month. A concerning examination of when you people sleep.
- **AI observations:** humor styles, texting personalities, recurring topics, inside jokes, and the overall dynamic.
- **Graceful fallback:** if AI is unavailable, your statistics still show up. The numbers have no business hours.

## built with

| Part                       | Stack                                    |
| -------------------------- | ---------------------------------------- |
| Frontend                   | Next.js, React, TypeScript, Tailwind CSS |
| Animation and charts       | Framer Motion, Recharts                  |
| Backend                    | Python, FastAPI                          |
| AI                         | OpenAI API                               |
| Persistent daily allowance | Upstash Redis                            |
| Hosting                    | Vercel frontend, Render backend          |

## run it locally

You’ll need:

- Python 3.13, which is what the Render deployment runs (3.13.5) and what CI tests. The code needs at least 3.10, but older versions aren’t tested.
- Node.js 20.9 or newer, as Next.js 16 requires. CI uses Node 22.
- An OpenAI API key for AI analysis.
- An Upstash Redis database and a write-capable REST token for the daily allowance.

The instructions below use Windows PowerShell. Open the project folder in VS Code and use two terminals.

### 1. Backend

From the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create your local environment file if it doesn’t already exist:

```powershell
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}
```

Edit `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.6
FRONTEND_URL=http://localhost:3000

UPSTASH_REDIS_REST_URL=your_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
AI_DAILY_LIMIT=20
```

Use the regular Upstash REST token, not the read-only token. The backend needs to update the counter.

Then start the API:

```powershell
uvicorn main:app --reload
```

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

Without working OpenAI and quota-store configuration, statistical analysis can still work, but AI analysis will be unavailable.

### 2. Frontend

In a second terminal, starting from the project root:

```powershell
cd frontend
npm install
```

Create the frontend environment file if needed:

```powershell
if (!(Test-Path .env.local)) {
    Copy-Item .env.local.example .env.local
}
```

Set this in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```powershell
npm run dev
```

Open http://localhost:3000 and keep both servers running.

Restart the relevant server after changing environment variables. For a deployed frontend, rebuild and redeploy after changing `NEXT_PUBLIC_API_URL`.

## configuration

| Location              | Variable                   | Purpose                                                       |
| --------------------- | -------------------------- | ------------------------------------------------------------- |
| `backend/.env`        | `OPENAI_API_KEY`           | Server-side credential for AI analysis                        |
| `backend/.env`        | `OPENAI_MODEL`             | Model used for analysis; defaults to `gpt-5.6`. Must support Structured Outputs (`json_schema`) |
| `backend/.env`        | `FRONTEND_URL`             | Additional frontend origin allowed by CORS; a trailing slash is ignored |
| `backend/.env`        | `UPSTASH_REDIS_REST_URL`   | REST endpoint for the persistent daily counter                |
| `backend/.env`        | `UPSTASH_REDIS_REST_TOKEN` | Write-capable REST token                                      |
| `backend/.env`        | `AI_DAILY_LIMIT`           | Shared AI attempts per Toronto calendar day; defaults to `20` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL`      | Backend URL used by the browser                               |

`NEXT_PUBLIC_` values are visible in the browser. Your backend’s public URL belongs there. Your OpenAI key and Redis token absolutely do not.

Commit the example environment files with placeholders. Never commit real environment files, credentials, or private chat exports.

### Production configuration

- Set `NEXT_PUBLIC_API_URL` in Vercel to the public Render backend URL.
- Set `FRONTEND_URL` in Render to the frontend’s production origin, without a trailing slash.
- Store OpenAI and Upstash credentials in Render’s environment settings.
- Run the Render backend with one worker and one service instance while using the current in-memory request limiter:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
```

The public API URL is configuration, not a secret. CORS is not authentication, and the API doesn’t use cookies, so CORS credentials are disabled.

## feed it the lore

1. Export a WhatsApp chat without media, or prepare a copied Instagram conversation as a `.txt` file.
2. Select or drag the file into the upload area.
3. Run the analysis.
4. Receive statistics you may immediately wish you hadn’t asked for.

The frontend rejects empty files and files larger than 10 MiB. The backend also enforces an application-level read limit.

Media files themselves are not analyzed. Media-only messages still count as messages, but recognized placeholders such as `image omitted` or `<attached: …>` don't add words, characters, or emojis.

### WhatsApp format

Example:

```text
[2025-05-16, 4:23:03 AM] Alex: hello
[2025-05-16, 4:24:03 AM] Sam: deeply insightful
```

The parser supports year-first dates, several slash-separated formats, 12-hour and 24-hour times, multiline messages, and common invisible export characters.

For non-year-first dates, it examines the file to choose one consistent day/month or month/day convention. If every date is ambiguous, it defaults to day/month/year. The parser supports a code-level override, but the upload interface does not currently expose it. Two-digit years follow Python’s `%y` rule: `69`–`99` mean the 1900s, and `00`–`68` mean the 2000s.

Conflicting date conventions reject the WhatsApp parse and currently produce a generic unsupported-export error through the API.

A message header must be bracketed (`[date, time] Name:`) or followed by a dash (`date, time - Name:`). Lines inside a multiline message that merely start with a date stay part of that message.

Recognized English encryption notices, call records, empty entries, and group-creation and subject-change notices are excluded.

Within messages, recognized media placeholders (`image omitted`, `<Media omitted>`, `<attached: …>`, `… (file attached)`, `Contact card omitted`, and similar) are treated as media rather than words. Captions sent with media still count as text. Deleted-message notices count as messages with no text, and the `<This message was edited>` marker is ignored.

Not every system-notice format or locale is supported.

### Copied Instagram format

Example, newest first:

```text
Alex
hello
Dec 15, 2025 3:07 pm
Sam
deeply insightful
Dec 15, 2025 3:06 pm
```

The parser expects a sender line, message content, and an English timestamp.

It removes recognized “Liked a message” and “Reacted … to your message” activity entries, plus trailing reaction annotations such as `❤Alex`. Emoji-only messages and punctuation-led messages remain included.

A genuine message identical to a reaction annotation cannot be distinguished reliably in copied text. Entries without readable message content are excluded.

**The copied text must start with the first sender’s name.** Page titles, navigation, or headings above it aren’t supported: the parser treats the first line as a sender. It deliberately doesn’t guess that a one-time sender is really a header, because that would silently reassign a genuine participant’s message. A stray header shows up as an extra “participant”; remove it from the file and upload again.

When every timestamp is identical, the parser can’t tell whether the copy is newest-first or oldest-first, so it keeps the copied order.

Copied text is ambiguous in other ways too. Instagram timestamps have minute precision, and a message whose last line looks like `❤Name` is treated as a reaction.

Native Instagram JSON and HTML exports are not directly supported.

The displayed count describes the parsed messages in the uploaded file—not necessarily every message ever exchanged.

## what the numbers actually mean

The jokes are optional. The definitions aren’t.

| Metric (API key)                                   | Definition                                                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Conversation start (`conversationStarts`)          | The first message, or a message following at least six hours of inactivity                                                  |
| Consecutive messages (`doubleTexts`)               | Each extra message from the same sender before anyone else talks, with gaps under six hours; a burst of six counts as five. There’s no shorter time threshold, so a reply-free burst over an afternoon still counts |
| Reply gap (`medianResponseTimeSeconds`)            | The gap when the sender changes, excluding gaps of six hours or more; the dashboard shows each person’s median               |
| Words per message (`averageWordsPerMessage`)       | Readable words divided by all messages, including media-only ones                                                           |
| Award tie                                          | All participants sharing the winning value are displayed                                                                    |
| No winner                                          | Used when nobody qualifies, including zero activity for a positive-count award or no valid reply-gap data                   |

A zero-second reply gap is valid when messages share a timestamp. The results page shows these definitions under the head-to-head stats.

### Group chats

With three or more people, nobody can tell from an export who was answering whom. The reply gap is still the time before someone spoke after a different sender, so the page labels it “gap before jumping in” and renames the fastest-responder award to “quickest to jump in”. The AI is told explicitly that reply relationships are unknown in group chats.

Participation, activity, consecutive-message, and conversation-start statistics work the same for any number of people. Exports from very large groups can make the AI output long, and the AI result is rejected if it leaves anyone out.

These metrics describe messaging patterns. They do not measure affection, effort, compatibility, or whether someone secretly hates you.

### Known counting limitations

Media and system-notice detection only covers recognized English formats. Placeholders or notices in other languages can still contribute artificial words or participants.

Emoji counting is a small range-based approximation, not full Unicode emoji support. Emojis with skin tones, joined sequences (like family emojis), and country flags each count as one emoji, and ❤ and ❤️ count as the same. Keycaps (#️⃣), subdivision flags, and some symbols outside the checked ranges (such as ⭐ and ⌚) aren’t counted. A maintained segmentation library would close those gaps, but the backend would gain a dependency for a stat the page doesn’t currently display.

## the AI has opinions, not a psychology degree

AI analysis is automatic when the service and daily allowance are available.

The backend sends participant names, calculated statistics, text statistics, and selected message excerpts to OpenAI.

How the sample is chosen:

- Short chats (200 readable messages or fewer) are sent in full.
- Longer chats are sampled as about ten excerpts of 20 consecutive messages, spread evenly from the very beginning to the very end. Keeping replies next to each other preserves context.
- Excerpts that would overlap or touch are merged, so no message is sent twice and the total stays at 200 or fewer.
- The selection is deterministic: the same file always produces the same sample.
- Each excerpt is labelled with its position (for example, messages 1,201–1,220 of 5,000). The model is told the excerpts have gaps between them and that it hasn’t seen the whole chat.
- Media-only and deleted messages are skipped; captions are kept.
- Each sampled message, and each participant’s longest message, is capped at 500 characters.

The results page says how many messages and excerpts the AI saw.

The model sees a sample, so it can miss context, running jokes, and the bit you’ve been committing to for three years.

The request uses Structured Outputs: a strict JSON schema built from the detected participant names, with confidence limited to 0–100. The configured model must support it; if it doesn’t, the request fails and the AI fallback is shown. The schema doesn’t catch every problem, so the backend still checks that every participant appears exactly once, that all names and types are correct, and that confidence is a finite number in range.

The model returns participants as a list. The backend converts it to the name-keyed object the frontend uses, so the API response shape hasn’t changed. Successful results also include a `sample` object describing what the AI saw.

Refusals, cut-off responses, timeouts, API errors, and responses that fail validation all show the fallback message, and your statistics still appear. Every one of those still uses up a daily attempt.

The displayed confidence is a model-generated impression, not a calibrated probability.

### Privacy

Only upload conversations you have permission to share.

Upstash receives quota keys and counters, not chat content. OpenAI receives the analysis inputs described above, including real participant names; pseudonymization is not currently implemented.

Application code does not explicitly save uploaded chats as permanent files. That does not establish what temporary upload handling, hosting infrastructure, or external providers retain.

The upload page discloses the OpenAI processing. This project makes no promises about external providers’ retention policies.

## the AI also has a bedtime

The current deployment uses three separate controls:

| Control                    | Current behavior                                          |
| -------------------------- | --------------------------------------------------------- |
| Processing capacity        | At most 2 analyses processing simultaneously              |
| Shared minute allowance    | 5 recognized chat analyses per minute across all visitors |
| Persistent daily allowance | 20 AI attempts per Toronto calendar day                   |

Invalid uploads and requests rejected because processing slots are full do not consume the shared minute allowance.

A daily slot is reserved immediately before an OpenAI request. Failed requests still consume that slot because a timeout or unusable response may incur charges.

The daily allowance resets at midnight Toronto time. Its counter is stored in Upstash and survives backend restarts.

If the daily allowance is exhausted—or the quota store cannot be reached—the app skips AI and still returns statistics.

The counter reservation is atomic, so simultaneous requests cannot claim the same remaining slot.

The minute allowance and processing capacity are stored in process memory. They reset on restart and are not shared across workers or service instances.

Local and deployed backends use the same daily allowance if configured with the same Upstash database.

These are request-volume controls, not a dollar cap. Twenty attempts a day limits how many OpenAI calls can happen, but each call costs a different amount depending on the model, the prompt size, and the output length. Set a spending limit in your OpenAI account if you need a hard money ceiling.

### Why the limits are shared

The minute allowance uses one bucket for everyone on purpose. In testing on Render, a client could choose its own `request.client.host` by sending an `X-Forwarded-For` header, and the last address in the forwarded chain belonged to an internal proxy, not the visitor. `CF-Connecting-IP` matched the real address in a normal request, but there’s no documented, complete trust boundary for it. Until one is verified, picking any forwarded address would let visitors dodge or frame each other.

The cost of this is fairness: one visitor can use up the minute allowance or the daily AI allowance for everyone.

## project structure

```text
.github/workflows/ci.yml

backend/
  main.py
  request_limits.py
  daily_quota.py
  requirements.txt
  parsers/
    whatsapp.py
    instagram.py
  analysis/
    message_content.py   media/deleted/edited detection shared by all stats
    statistics.py
    behavior.py
    awards.py
    activity.py
    text_stats.py
    ai_analysis.py
    sentiment.py         experimental, unused
    topics.py            experimental, unused
  tests/

frontend/
  app/
    page.tsx             landing page (/)
    analyze/page.tsx     upload and results (/analyze)
    layout.tsx
    globals.css
  components/
    ActivitySection.tsx
    AIAnalysisSection.tsx
    AwardsSection.tsx
    ExportGuide.tsx
    ParticipantStats.tsx
    UploadSection.tsx
    ui.tsx
  types/
    analysis.ts
```

The analyze page manages selected files, API requests, and page composition. Components render individual sections. Shared response types live in `types/analysis.ts`.

### Experimental modules

`sentiment.py` and `topics.py` are hooks for possible future local analysis. Nothing imports them: `main.py` passes empty `sentiment` and `topics` values to the response and the AI prompt. Their dependencies (transformers, sentence-transformers, scikit-learn) are deliberately left out of `requirements.txt`, so importing either one in the deployed backend would fail.

The backend validates uploads and runs decoding, parsing, statistics, and AI processing in a worker thread. `daily_quota.py` handles the persistent AI allowance.

## checks before declaring yourself goated

### Backend tests

From the project root:

```powershell
cd backend
python -m unittest discover -s tests -t . -v
```

The tests cover:

- WhatsApp and Instagram parsing, including date conventions and notices.
- Media, deleted, and edited markers.
- Emoji counting.
- Metric definitions in two-person and group chats.
- AI sampling, the output schema, and validation.
- Refusal, cut-off, and timeout handling.
- Quota handling and upload/rate-limit behavior.

OpenAI and the quota store are always mocked.

They do not spend OpenAI credits or change the live daily allowance.

The upload tests call the endpoint function directly; they do not test HTTP multipart parsing.

### Frontend checks

From `frontend`:

```powershell
npm run build
npm run lint
```

A successful build checks compilation and TypeScript. It does not prove parser accuracy, deployment configuration, or live API behavior. `next/font/google` downloads fonts during the build, so it needs network access to Google Fonts.

### Continuous integration

`.github/workflows/ci.yml` runs the backend tests (Python 3.13), frontend lint, and the frontend production build (Node 22) on pushes to `main` and on pull requests. It needs no OpenAI or Upstash secrets. Since Python 3.12, `unittest` exits with an error when discovery finds no tests, so a broken discovery setup fails CI instead of passing silently.

Representative exports and the AI fallback should also be tested manually. The Redis reservation script has separately passed a live concurrency smoke test using an isolated counter.

## troubleshooting the overthinking machine

| Symptom                         | Check                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Cannot reach the server         | Confirm the backend is running and `NEXT_PUBLIC_API_URL` points to it                          |
| Live website calls `127.0.0.1`  | Fix Vercel’s production environment variable, then rebuild and redeploy                        |
| Browser reports CORS errors     | Check that Render’s `FRONTEND_URL` matches the frontend origin                                 |
| No messages detected            | Compare the export layout with the supported examples                                          |
| AI unavailable but stats appear | Check OpenAI configuration, Upstash configuration, backend error logs, and the daily allowance |
| `429` response                  | The shared minute allowance is exhausted; wait before retrying                                 |
| `503` response                  | Processing capacity is full, or the limiter cannot admit another request                       |
| Incorrect activity dates        | Check the export’s day/month convention                                                        |
| Tests report zero cases         | Use the explicit discovery command above and keep `tests/__init__.py`                          |

## still on the list

- Per-visitor fairness and bot protection. This needs a verified trust boundary for client addresses first.
- **An infrastructure-level upload-size limit before multipart processing.** The 10 MiB check in `main.py` runs only after the multipart body has been received and parsed, so it doesn’t protect the server from a huge upload. This needs configuring at the hosting or proxy layer.
- Non-English system notices and media placeholders.
- A visible date-convention indicator or override for ambiguous exports.
- Possibly: caching AI results by content hash, or returning stats first and AI second. Both are design changes with privacy and API consequences, so neither has been started.

For now: useful numbers, questionable awards, and a machine with far too much confidence in its understanding of your friendship.
