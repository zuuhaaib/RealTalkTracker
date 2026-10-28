# Talk Tracker

A conversation analytics app for WhatsApp and copied Instagram text exports. Upload a chat to compare participation, reply times, conversation starts, activity, and playful AI observations.

## Features

- WhatsApp text parsing, including multiline messages and media placeholders
- Copied Instagram text parsing with reaction annotation filtering
- Message counts, word counts, message shares, and average message length
- Conversation starts, consecutive messages, and median response times
- Chat awards and activity charts by hour, weekday, and month
- AI-generated humor, texting-style, and conversation observations
- Statistical results remain available if AI analysis fails

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Recharts
- Backend: Python, FastAPI, OpenAI SDK

## Local setup (Windows PowerShell)

Install Node.js with npm and Python 3.10 or newer. Open the project folder in VS Code and use two terminals.

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and supply your own OpenAI API key. If `.env` already exists, update it instead of overwriting it. Then run:

```powershell
uvicorn main:app --reload
```

API: http://127.0.0.1:8000
Interactive API documentation: http://127.0.0.1:8000/docs

### Frontend

In a second terminal, starting from the project root:

```powershell
cd frontend
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

If `.env.local` already exists, update it instead of overwriting it.

Open http://localhost:3000. Keep both servers running. Restart the frontend after changing environment variables.

## Configuration

| Location            | Variable            | Purpose                                                             |
| ------------------- | ------------------- | ------------------------------------------------------------------- |
| backend/.env        | OPENAI_API_KEY      | Server-side key used for AI analysis                                |
| backend/.env        | FRONTEND_URL        | Frontend origin allowed by CORS; locally http://localhost:3000      |
| frontend/.env.local | NEXT_PUBLIC_API_URL | Backend URL reachable by the browser; locally http://127.0.0.1:8000 |

Never put an API key in a variable beginning with `NEXT_PUBLIC_`: these values are exposed to the browser. Never commit real environment files or private chat exports.

## Using the app

1. Export a WhatsApp conversation without media, or prepare a copied Instagram conversation as a `.txt` file.
2. Select or drag the file into the upload area.
3. Run the analysis and review the statistics, charts, and AI results.

The endpoint accepts text files up to 10 MiB. Uploaded media files are not analyzed; textual media placeholders can still count as messages.

### Supported formats and limitations

WhatsApp example:

```text
[2025-05-16, 4:23:03 AM] Alex: hello
```

The parser also supports several slash-separated dates and 24-hour timestamps. Ambiguous non-year-first dates default to day/month/year unless the second number is greater than 12. Verify the date convention of your export. Recognized English encryption notices, call records, and empty entries are excluded; media placeholders remain included.

Copied Instagram example (newest first):

```text
Alex
hello
Dec 15, 2025 3:07 pm
```

The Instagram parser expects sender, message, then an English timestamp. It removes recognized activity entries and trailing emoji-plus-participant reaction annotations. A genuine message identical to a reaction annotation cannot be distinguished reliably in this copied format. Native Instagram JSON and HTML exports are not currently supported directly.

Export completeness depends on the source export. The displayed count describes the readable messages in the uploaded file, not necessarily every message ever exchanged.

## How statistics are defined

- Conversation start: the first message, or a message following at least six hours of inactivity.
- Double text: another consecutive message from the same sender within the six-hour conversation window. A run of three messages adds two double texts.
- Response time: the gap when the sender changes, excluding gaps of six hours or more. The dashboard displays the median.
- Award ties: the current implementation selects the first participant with the winning value.

These metrics describe messaging patterns; they do not establish effort, affection, or personality.

## AI analysis and privacy

Participant names, statistics, text statistics, and selected message excerpts are sent to OpenAI. The sample includes up to 200 messages, with each sampled message capped at 500 characters. Each participant's longest message included in the AI prompt is also capped at 500 characters.

Only upload conversations you have permission to share. AI observations can be inaccurate; the displayed confidence is a model-generated impression, not a calibrated probability. This README makes no claims about OpenAI's data retention policies.

The backend processes uploads without explicitly saving chat files in application code. This is not a guarantee about hosting infrastructure, temporary upload handling, or provider retention. Review those separately before deployment.

## Frontend structure

```text
frontend/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    ActivitySection.tsx
    AIAnalysisSection.tsx
    AwardsSection.tsx
    ParticipantStatsSection.tsx
    UploadSection.tsx
    ui.tsx
  types/
    analysis.ts
```

`page.tsx` manages uploads, API requests, and page composition. Components display the result sections, while `types/analysis.ts` defines shared response types.

## Checks

From `frontend`:

```powershell
npm run build
npm run lint
```

A successful build checks compilation and TypeScript; it does not verify parser accuracy or a live AI request. Test representative exports and the AI failure fallback separately.

## Troubleshooting

- Connection errors: confirm the backend is running and `NEXT_PUBLIC_API_URL` points to it. For another frontend origin, configure `FRONTEND_URL` and restart the backend.
- No messages detected: check the export layout against the supported examples.
- AI unavailable: check the backend API key and API account configuration. The statistical results should still display.
- Incorrect dates: check the export's day/month convention.

## Deployment status

The upload endpoint has an application-level read limit, but authentication, rate limiting, and infrastructure-level request limits still need attention before public deployment. Each successful AI request can incur API costs. CORS is not authentication or a spending control.
