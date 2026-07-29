# Aethera

An AI-powered educational platform for students (Grades 6–12) with a bold Neobrutalism UI. Students can ask questions, upload homework images/PDFs, get step-by-step AI explanations, practice with generated quizzes, and track their learning memory.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/aethera run dev` — run the frontend (port 20619)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Wouter routing + TanStack Query
- Styling: TailwindCSS v4 + Neobrutalism design system (Space Grotesk font, hard shadows, thick borders)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (v3), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle table definitions (users, sessions, messages, uploads, learning_memory, quizzes)
- `artifacts/api-server/src/routes/` — Express route handlers (sessions, chat, uploads, memory, quizzes, profile, dashboard)
- `artifacts/aethera/src/` — React frontend (pages: landing, chat, history, profile)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit manually)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit manually)

## Architecture decisions

- OpenAPI-first: all types flow from `openapi.yaml` → codegen → frontend hooks + backend Zod validators
- Single demo user (id=1) — no auth implemented yet; profile/memory/sessions all scoped to user 1
- AI responses are simulated (no real LLM call) — swap `generateEducationalResponse()` in `chat.ts` for real AI when ready
- OCR is simulated — `uploads.ts` returns a fixed extracted text string; wire to Google Vision API when ready
- Integer fields in OpenAPI spec use `type: number` (not `type: integer`) — Orval + Zod v3 incompatibility workaround

## Product

- `/` — Bold neobrutalist landing page with CTA
- `/chat` — Main AI learning workspace: sidebar with sessions, chat thread, file upload
- `/history` — Past conversation sessions with delete
- `/profile` — User settings, learning memory (strong/weak topics), dashboard stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` whenever DB schema changes — stale lib declarations cause false "no exported member" errors
- OpenAPI spec must use `type: number` (not `type: integer`) — Orval generates `zod.int()` for integers which doesn't exist in Zod v3
- After any `openapi.yaml` change, run codegen before touching routes
- Demo user is always id=1; `ensureProfileExists()` / `ensureMemoryExists()` auto-create it on first request

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
