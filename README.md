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
| Accounts                   | Supabase Auth (email, password, Google)  |
| Hosting                    | Vercel frontend, Render backend          |

## run it locally

You’ll need:

- Python 3.13, which is what the Render deployment runs (3.13.5) and what CI tests. The code needs at least 3.10, but older versions aren’t tested.
- Node.js 20.9 or newer, as Next.js 16 requires. CI uses Node 22.
- An OpenAI API key for AI analysis.
- An Upstash Redis database and a write-capable REST token for the daily allowance.
- A Supabase project for accounts. Analyzing a chat requires signing in; see [accounts](#accounts) below.

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
AI_DAILY_LIMIT=100
AI_USER_DAILY_LIMIT=3

SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use the regular Upstash REST token, not the read-only token. The backend needs to update the counter.

Then start the API:

```powershell
uvicorn main:app --reload
```

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

Without working OpenAI and quota-store configuration, statistical analysis can still work, but AI analysis will be unavailable. Without the Supabase values, every analysis request is refused with `503`, because nobody can be signed in.

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

Set these in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Start the frontend:

```powershell
npm run dev
```

Open http://localhost:3000 and keep both servers running.

Restart the relevant server after changing environment variables. For a deployed frontend, rebuild and redeploy after changing any `NEXT_PUBLIC_` value.

## configuration

| Location              | Variable                   | Purpose                                                       |
| --------------------- | -------------------------- | ------------------------------------------------------------- |
| `backend/.env`        | `OPENAI_API_KEY`           | Server-side credential for AI analysis                        |
| `backend/.env`        | `OPENAI_MODEL`             | Model used for analysis; defaults to `gpt-5.6`. Must support Structured Outputs (`json_schema`) |
| `backend/.env`        | `FRONTEND_URL`             | Additional frontend origin allowed by CORS; a trailing slash is ignored |
| `backend/.env`        | `UPSTASH_REDIS_REST_URL`   | REST endpoint for the persistent daily counter                |
| `backend/.env`        | `UPSTASH_REDIS_REST_TOKEN` | Write-capable REST token                                      |
| `backend/.env`        | `AI_DAILY_LIMIT`           | AI attempts per Toronto calendar day for the whole site; defaults to `100` |
| `backend/.env`        | `AI_USER_DAILY_LIMIT`      | AI attempts per Toronto calendar day for each account; defaults to `3` |
| `backend/.env`        | `SUPABASE_URL`             | Supabase project URL, used to verify each sign-in token       |
| `backend/.env`        | `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key, sent with that check         |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL`      | Backend URL used by the browser                               |
| `frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for signing in                           |
| `frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key for signing in    |
| `frontend/.env.local` | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional Cloudflare Turnstile site key; shows the human check on log in and sign up |

`NEXT_PUBLIC_` values are visible in the browser. Your backend’s public URL and Supabase’s publishable key belong there; Supabase designs that key to be public. Your OpenAI key, Redis token and Supabase secret key absolutely do not.

Commit the example environment files with placeholders. Never commit real environment files, credentials, or private chat exports.

### Production configuration

- Set `NEXT_PUBLIC_API_URL` in Vercel to the public Render backend URL.
- Set `FRONTEND_URL` in Render to the frontend’s production origin, without a trailing slash.
- Store OpenAI and Upstash credentials in Render’s environment settings, with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel to the same project’s values.
- Run the Render backend with one worker and one service instance while using the current in-memory request limiter:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
```

The public API URL is configuration, not a secret. CORS is not authentication, and the API doesn’t use cookies (sign-in travels as a bearer token header), so CORS credentials are disabled.

## accounts

Analyzing a chat requires a free account. Accounts are Supabase users, with email and password or with Google; TalkTracker stores nothing about them itself.

- `/register` creates an account and `/login` signs in. Both are in TalkTracker’s own design.
- Both pages also offer **Continue with Google**. The first Google sign-in creates the account; later ones log in. The button only appears when the Google provider is enabled in the Supabase project, and Google sends people back through `/auth/confirm`.
- `frontend/proxy.ts` sends signed-out visitors from `/analyze` to `/login` (and back again after signing in), and sends signed-in visitors away from the login and register pages.
- The upload sends the Supabase access token as `Authorization: Bearer …`. `backend/auth.py` asks Supabase (`GET /auth/v1/user`) whether that token belongs to a signed-in user before reading the file, so a signed-out request never takes a processing slot or uses the minute allowance.
- An expired or revoked session gets `401`, and the page sends the visitor back to log in.

To set up a Supabase project:

1. Create a project at supabase.com. Copy the project URL and the publishable (anon) key from **Project Settings → API keys** into both environment files.
2. Under **Authentication → URL Configuration**, set the Site URL to your frontend (http://localhost:3000 locally) and add `http://localhost:3000/auth/confirm` plus your production `/auth/confirm` URL to the redirect URLs.
3. For Google sign-in, enable the Google provider under **Authentication → Sign In / Providers**, with a Google Cloud OAuth client ID and secret. In Google Cloud, the OAuth client’s authorized redirect URI is the callback URL Supabase shows on that page (`https://<project>.supabase.co/auth/v1/callback`).
4. Email confirmation is on by default: new users get a link that lands on `/auth/confirm` and signs them in. Supabase’s built-in email sender is rate-limited, so configure your own SMTP before real traffic, or turn confirmation off under **Authentication → Sign In / Providers → Email**.
5. Optional CAPTCHA. Create a Cloudflare Turnstile widget for your domains, put its **site key** in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and deploy the frontend, then turn on **Authentication → Attack Protection → CAPTCHA protection** in Supabase with Turnstile and the **secret key**. Deploy first: once Supabase requires CAPTCHA, email log in and sign up fail on any frontend that doesn't send it. Google sign-in isn't affected.
6. Check **Authentication → Rate Limits**, which caps how fast accounts can be created and emails sent.

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

The backend sends participant names, calculated statistics, text statistics, and selected message excerpts to OpenAI. The text statistics (top words and emojis, links, questions, media and late-night counts, each person's longest message) are only computed for the AI; they aren't returned to the browser.

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

The same request also writes a 120 to 150 word fictional `story` starring the participants, so it costs no extra daily allowance. The characters come from the personality profiles the model wrote; the plot is invented and the model is told not to reuse quotes, jokes, topics or events from the chat. The model writes a short private outline first (never returned) so the plot has a clear goal, problem and ending. The story is optional in the response: if it is missing, empty, or over 260 words, the backend leaves it out and keeps the rest of the analysis.

Refusals, cut-off responses, timeouts, API errors, and responses that fail validation all show the fallback message, and your statistics still appear. Every one of those still uses up a daily attempt.

The displayed confidence is a model-generated impression, not a calibrated probability.

### Privacy

Only upload conversations you have permission to share.

Supabase stores each account’s email address and password hash, plus the results of any chat its owner chooses to save (names, statistics and AI text, which can quote messages). It never receives the chat file. Upstash receives quota keys and counters, not chat content. OpenAI receives the analysis inputs described above, including real participant names; pseudonymization is not currently implemented.

Application code does not explicitly save uploaded chats as permanent files. That does not establish what temporary upload handling, hosting infrastructure, or external providers retain.

The upload page discloses the OpenAI processing. This project makes no promises about external providers’ retention policies.

## the AI also has a bedtime

The current deployment uses these controls:

| Control                     | Current behavior                                              |
| --------------------------- | ------------------------------------------------------------- |
| Processing capacity         | At most 2 analyses processing simultaneously                  |
| Account minute allowance    | 5 recognized chat analyses per minute for each account        |
| Shared minute allowance     | 30 recognized chat analyses per minute across everyone        |
| Account daily AI allowance  | 3 AI attempts per account per Toronto calendar day (`AI_USER_DAILY_LIMIT`) |
| Site daily AI allowance     | 100 AI attempts per Toronto calendar day in total (`AI_DAILY_LIMIT`)       |

Invalid uploads and requests rejected because processing slots are full do not consume a minute allowance. A request turned away by one minute allowance doesn't use up the other.

A daily slot is reserved immediately before an OpenAI request. Failed requests still consume that slot because a timeout or unusable response may incur charges. A slot counts against both the account and the site, and is only taken when both have room.

The daily allowances reset at midnight Toronto time. Their counters live in one Upstash hash per day (`talktracker:ai-quota:<date>`) and survive backend restarts. Accounts are stored as a SHA-256 hash of their Supabase user id, not the id or email.

If a daily allowance is exhausted—or the quota store cannot be reached—the app skips AI and still returns statistics.

The counter reservation is atomic, so simultaneous requests cannot claim the same remaining slot.

The minute allowance and processing capacity are stored in process memory. They reset on restart and are not shared across workers or service instances.

Local and deployed backends use the same daily allowance if configured with the same Upstash database.

These are request-volume controls, not a dollar cap. A hundred attempts a day limits how many OpenAI calls can happen, but each call costs a different amount depending on the model, the prompt size, and the output length. Set a spending limit in your OpenAI account if you need a hard money ceiling.

### Why limits are per account, not per IP

Every analysis needs a signed-in account, so limits are keyed to the Supabase user id that the backend verifies. IP addresses aren't used on purpose. In testing on Render, a client could choose its own `request.client.host` by sending an `X-Forwarded-For` header, and the last address in the forwarded chain belonged to an internal proxy, not the visitor. `CF-Connecting-IP` matched the real address in a normal request, but there’s no documented, complete trust boundary for it. Until one is verified, picking any forwarded address would let visitors dodge or frame each other.

Allowances follow the person's inbox, not just the account: the backend lowercases the verified email, drops any `+tag`, and for Gmail drops dots too, so `pat+1@gmail.com`, `p.at@gmail.com` and a deleted-and-recreated account all share one allowance. Accounts without an email fall back to their user id. Only a hash of that value reaches Upstash.

This is only as strong as account creation: someone willing to make accounts on several real inboxes gets several allowances. The site-wide daily allowance still caps the total, and email confirmation, Supabase's sign-up rate limits and the optional CAPTCHA make throwaway accounts slower to create.

## project structure

```text
.github/workflows/ci.yml

backend/
  main.py
  auth.py                checks the Supabase sign-in token on each upload
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
  tests/

frontend/
  proxy.ts               keeps the session fresh; guards /analyze
  app/
    page.tsx             landing page (/)
    analyze/page.tsx     upload and results (/analyze)
    guide/page.tsx       export guide (/guide)
    login/page.tsx       log in (/login)
    register/page.tsx    create an account (/register)
    auth/confirm/route.ts  email confirmation links and Google sign-in land here
    layout.tsx
    globals.css
  components/
    ActivitySection.tsx
    AIAnalysisSection.tsx
    AuthForm.tsx         the login and register form
    AuthNav.tsx          log in / sign up / log out in the header
    GoogleButton.tsx     Continue with Google
    AwardsSection.tsx
    ExportGuide.tsx
    ParticipantStats.tsx
    UploadSection.tsx
    ui.tsx
  lib/
    demoChat.ts          the landing page’s fictional chat and its numbers
    supabase/            Supabase settings and the browser client
  types/
    analysis.ts
```

The analyze page manages selected files, API requests, and page composition. Components render individual sections. Shared response types live in `types/analysis.ts`.

### How the backend is organized

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
- Sign-in checks: missing, expired and valid tokens, an unconfigured server, Supabase being unreachable, and that rejected requests use no allowance.

OpenAI, the quota store and Supabase are always mocked.

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
| `401` response, sent to log in  | The session expired or was signed out; log in again                                            |
| Login page says sign-in isn’t set up | Set the `NEXT_PUBLIC_SUPABASE_` values in `frontend/.env.local` (or Vercel), then restart or redeploy |
| `503` “sign-in isn’t configured” | Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` on the backend                              |
| No Google button on login       | Enable the Google provider in Supabase; the button appears once it’s on |
| Google sign-in returns to login with a note | It was cancelled, or the `/auth/confirm` URL isn’t in Supabase’s redirect URLs |
| Confirmation link doesn’t sign in | Add your `/auth/confirm` URL to Supabase’s redirect URLs, and open the link in the same browser |
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
