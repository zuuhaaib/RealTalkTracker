# talktracker

### who's actually carrying the chat?

A deeply unnecessary analysis of your texts.

Upload a WhatsApp or copied Instagram conversation and find out who yaps more, replies faster, starts everything, and keeps the conversation alive. Then let a language model decide who’s funnier, because apparently we needed outside arbitration.

[Open the app](https://real-talk-tracker.vercel.app)

## the damage report

- **Head to head:** message counts, word counts, message shares, and average message length.
- **Texting habits:** median response times, conversation starts, and double texts.
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

- Python 3.10 or newer.
- Node.js and npm compatible with the project’s Next.js version.
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
| `backend/.env`        | `OPENAI_MODEL`             | Model used for analysis; defaults to `gpt-5.6`                |
| `backend/.env`        | `FRONTEND_URL`             | Additional frontend origin allowed by CORS                    |
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

The public API URL is configuration, not a secret. CORS is not authentication.

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

For non-year-first dates, it examines the file to choose one consistent day/month or month/day convention. If every date is ambiguous, it defaults to day/month/year. The parser supports a code-level override, but the upload interface does not currently expose it.

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

Header lines copied above the first message, such as the chat title, are skipped when the real sender appears elsewhere in the chat.

Native Instagram JSON and HTML exports are not directly supported.

The displayed count describes the parsed messages in the uploaded file—not necessarily every message ever exchanged.

## what the numbers actually mean

The jokes are optional. The definitions aren’t.

| Metric             | Definition                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Conversation start | The first message, or a message following at least six hours of inactivity                                                |
| Double text        | Another consecutive message from the same sender, with a gap of less than six hours; a run of three adds two double texts |
| Response time      | The gap when the sender changes, excluding gaps of six hours or more; the dashboard displays the median                   |
| Award tie          | All participants sharing the winning value are displayed                                                                  |
| No winner          | Used when nobody qualifies, including zero activity for a positive-count award or no valid response-time data             |

A zero-second response time is valid when messages share a timestamp.

These metrics describe messaging patterns. They do not measure affection, effort, compatibility, or whether someone secretly hates you.

### Known counting limitations

Media and system-notice detection only covers recognized English formats. Placeholders or notices in other languages can still contribute artificial words or participants.

Emojis with skin tones, joined emoji sequences (like family emojis), and flags each count as one emoji.

## the AI has opinions, not a psychology degree

AI analysis is automatic when the service and daily allowance are available.

The backend sends participant names, calculated statistics, text statistics, and selected message excerpts to OpenAI.

- The sample contains up to 200 readable messages, selected across the conversation.
- Recognized media-only placeholders are excluded from that sample.
- Each sampled message is capped at 500 characters.
- Each participant’s longest-message text included in the AI prompt is also capped at 500 characters.

The model sees a sample, so it can miss context, running jokes, and the bit you’ve been committing to for three years.

AI output is checked for the fields and participant names expected by the frontend. Invalid or incomplete results produce a fallback instead of being displayed as normal results.

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

These are request-volume controls, not an exact dollar spending cap. One anonymous visitor can still consume the shared allowance.

## project structure

```text
backend/
  main.py
  request_limits.py
  daily_quota.py
  requirements.txt
  parsers/
    whatsapp.py
    instagram.py
  analysis/
    statistics.py
    behavior.py
    awards.py
    activity.py
    text_stats.py
    ai_analysis.py
  tests/

frontend/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    ActivitySection.tsx
    AIAnalysisSection.tsx
    AwardsSection.tsx
    ParticipantStats.tsx
    UploadSection.tsx
    ui.tsx
  types/
    analysis.ts
```

The frontend page manages selected files, API requests, and page composition. Components render individual sections. Shared response types live in `types/analysis.ts`.

The backend validates uploads and runs decoding, parsing, statistics, and AI processing in a worker thread. `daily_quota.py` handles the persistent AI allowance.

## checks before declaring yourself goated

### Backend tests

From the project root:

```powershell
cd backend
python -m unittest discover -s tests -v
```

The current tests cover chat parsing, media and emoji counting, quota handling, and upload/rate-limit behavior. External AI and quota-store requests are mocked.

They do not spend OpenAI credits or change the live daily allowance.

The upload tests call the endpoint function directly; they do not test HTTP multipart parsing.

### Frontend checks

From `frontend`:

```powershell
npm run build
npm run lint
```

A successful build checks compilation and TypeScript. It does not prove parser accuracy, deployment configuration, or live API behavior.

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

- Per-visitor fairness and bot protection.
- An infrastructure-level upload-size limit before multipart processing.
- Broader parser regression coverage and continuous integration.
- More complete handling of system notices, media placeholders, and timestamp-like continuation lines.
- A visible date-convention indicator or override for ambiguous exports.

For now: useful numbers, questionable awards, and a machine with far too much confidence in its understanding of your friendship.
