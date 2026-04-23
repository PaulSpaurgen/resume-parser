# Resume Interview Copilot (Task 1)

Prototype for the Exterview assignment task 1:
- upload a candidate resume (PDF),
- chat with an AI assistant about the candidate in multiple turns,
- use AI-generated suggested questions or free-text input,
- flag important AI responses for later review.

## Tech Stack

- Next.js (App Router) + TypeScript
- React Server + Client Components
- Zustand for client-side state slices
- OpenAI Chat Completions API (`gpt-4o-mini`)
- `pdf-parse` for PDF text extraction
- Tailwind CSS for UI styling

## Why this backend approach

No separate backend service is used. All server logic runs in Next.js route handlers:
- `app/api/upload/route.ts`
- `app/api/chat/route.ts`
- `app/api/suggestions/route.ts`

This keeps the prototype simple to run (`npm install && npm run dev`) while still protecting API keys on the server.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

3. Run development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Feature Coverage (Task 1)

### 1) Resume upload and ingestion

- Upload accepts PDF via `UploadInput`.
- `/api/upload` parses the file using `pdf-parse` (`parser.ts`).
- Parsed text is transformed into a structured `Resume` object:
  - Primary path: OpenAI schema extraction (name, headline, skills, experience).
  - Fallback path: heuristic parsing when extraction fails or key is missing.
- Structured resume is rendered in `ResumeView` (skills chips + experience cards), not as a raw text dump.

### 2) Dual input mode

Both input modes share the same chat pipeline.

- Mode A (free text): `ChatInput` sends typed message.
- Mode B (AI suggestions): `Suggestions` chips send selected question immediately.

Interaction behavior:
- Suggestions are generated immediately after a successful resume upload.
- Suggestions can be manually refreshed with the `Refresh` button.
- User can mix modes per turn without switching context.
- Suggestions remain available throughout the session (collapsible panel).

### 3) Multi-turn grounded chat

- `useChat` keeps turn history in order.
- Every chat request sends:
  - structured resume JSON,
  - full chat history,
  - latest user message.
- LLM prompt enforces grounded answers and short resume-based citations.
- AI response is schema-validated (`content`, `citations`) before rendering.

### 4) Flag insights

- Every assistant message can be toggled as flagged.
- Flagged items are listed in a dedicated `FlaggedList` panel in the same session.
- Scope: local in-memory session state (not persisted across reloads).

### 5) Loading / error / success states

Implemented for:
- Resume upload + parse
- Initial suggestion generation
- Suggestion refresh
- Chat responses

UX behaviors include inline loaders, disabled actions while pending, and user-visible error text per panel.

## LLM Context Structure

Chat uses OpenAI Chat Completions with JSON schema output.

For turn 3 (example shape), request messages are:

```ts
[
  {
    role: "system",
    content: "You are an interview copilot... grounded in resume evidence..."
  },
  {
    role: "user",
    content: "Resume JSON:\n{...structuredResume}"
  },
  { role: "user", content: "Question 1" },
  { role: "assistant", content: "Answer 1" },
  { role: "user", content: "Question 2" },
  { role: "assistant", content: "Answer 2" },
  { role: "user", content: "Question 3" }
]
```

Why this structure:
- Keeps the resume as a single grounding source for each turn.
- Preserves full conversation context for multi-turn coherence.
- Allows the model to reference earlier Q/A while staying resume-bound.

## Suggested Questions Logic

Generation:
- Triggered right after resume upload completes.
- Uses dedicated `/api/suggestions` endpoint and prompt specialized for recruiter-facing questions.
- Output schema enforces an array response and post-filter removes second-person wording.

Refresh policy:
- Manual refresh via `Refresh` in the suggestions panel.
- Suggestions do not auto-refresh after every turn (intentional to avoid distracting UI churn).

Relevance strategy:
- Suggestions are generated from structured resume data.
- Manual refresh lets recruiter pull a new set when conversation direction changes.

## Scale Considerations

If this needed to support hundreds of resumes or very large CVs:
- Persist session state in DB (resume, chat, flags) instead of in-memory client state.
- Add retrieval/chunking so each turn sends only relevant resume sections.
- Add background ingestion queue for PDF parsing and extraction.
- Add per-resume caching for extracted structure and suggestion sets.
- Stream chat responses and add request cancellation for better perceived latency.

## One Explicit Cut

Cut: persistent flagged insights/export.

Reason:
- Prioritized end-to-end upload -> suggest -> multi-turn grounded chat -> flag flow within assignment scope.
- Keeping flags in local session state reduced complexity and let more effort go to grounding, schema validation, and core UX states.

## Assumptions Made

- Single active resume per session.
- Recruiter primarily needs fast qualitative screening, not final hiring decisions.
- Resume parsing quality is acceptable for prototype-level complex layouts; fallback parser handles failures but is less precise.
- Manual suggestion refresh is sufficient for v1 instead of automatic per-turn regeneration.

## Known Limitations

- No persistence across reload (resume, chat, flags reset).
- No source-span highlighting in resume panel for each citation.
- Entire structured resume is sent every chat turn (simple but not token-optimal at scale).

## Project Structure (high level)

- `app/(resume)/components` UI for upload, chat, suggestions, resume display, flagged list
- `app/(resume)/hooks` orchestration for upload and chat flows
- `app/(resume)/store` Zustand slices for resume and suggestions
- `app/api/upload` PDF parsing and structured extraction
- `app/api/chat` grounded multi-turn chat endpoint
- `app/api/suggestions` suggested-question generation endpoint

## AI Usage Disclosure

- Tools used: Cursor
- Estimated AI contribution: ~25%
- AI used for:
  - sanity-checking prompt wording and error copy
  - quick refactoring suggestions for type-safe guards
- Fully self-authored:
  - component architecture and state flow
  - upload, chat, and suggestions API design
  - grounding strategy and fallback behavior decisions
  - final implementation and bug fixes
