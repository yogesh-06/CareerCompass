# CareerCompass

CareerCompass is a monorepo web application that generates personalized migration-career action plans using deterministic eligibility checks and Gemini-based narrative generation.

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Database: PostgreSQL + Prisma
- Auth: JWT access token
- AI: Gemini (`gemini-1.5-flash`)
- Testing: Vitest + Supertest

## Monorepo Structure

- `apps/backend` - API, deterministic engine, Gemini integration, auth, persistence
- `apps/frontend` - minimal functional UI for auth, plan generation, history, detail
- `packages/shared-types` - shared TypeScript interfaces
- `packages/shared-validation` - shared zod schemas
- `DECISIONS.md` - architecture and scope trade-off decisions

## API Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/plans/generate`
- `GET /api/v1/plans`
- `GET /api/v1/plans/:planId`
- `POST /api/v1/plans` (returns explicit message, generation endpoint auto-saves)
- `GET /api/v1/health`

## Environment Variables

Create `apps/backend/.env` from `apps/backend/.env.example`:

- `PORT=4000`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careercompass`
- `JWT_SECRET=replace_with_secure_secret`
- `GEMINI_API_KEY=your_gemini_key`

Create `apps/frontend/.env` from `apps/frontend/.env.example`:

- `VITE_API_BASE_URL=http://localhost:4000/api/v1`

## Local Setup

1. Install dependencies:
   - `npm install`
2. Run Prisma generate and migrations:
   - `npm run prisma:generate -w @careercompass/backend`
   - `npm run prisma:migrate -w @careercompass/backend -- --name init`
3. Seed scenario data:
   - `npm run prisma:seed -w @careercompass/backend`
4. Start backend:
   - `npm run dev -w @careercompass/backend`
5. Start frontend:
   - `npm run dev -w @careercompass/frontend`

## Build and Test

- Build all workspaces:
  - `npm run build`
- Run backend tests:
  - `npm run test -w @careercompass/backend`

## Assignment Coverage

- Deterministic handling of salary, timeline, and missing-data correctness checks
- Gemini used only for narrative personalization
- Data confidence summary returned with plan response
- Auth-protected endpoints for generation and saved plan retrieval
- Scenario-oriented seeded data for Germany/Senior Backend Engineer and UK/Product Manager