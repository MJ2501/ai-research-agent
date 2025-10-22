# AI Research Agent (Next.js + BullMQ + Postgres)


## Quick Start (local)
1. Copy `.env.example` to `.env` and adjust if needed.
2. `docker-compose up -d db redis`
3. `npm i`
4. `npx prisma migrate dev`
5. `npm run dev` (UI + API at http://localhost:3000)
6. In a second terminal: `npm run worker` (starts background processor)


## How it works
- POST `/api/research` creates a task (Step 1) and enqueues a BullMQ job.
- Worker consumes jobs, performs Steps 2–4, logs to `ResearchLog`.
- GET `/api/research/:id` returns task + logs + results.
- GET `/api/research/events/:id` streams logs via SSE.


## Deploy
- **Frontend (Vercel):** push repo, set `NEXT_PUBLIC_APP_URL` to your Vercel URL and point API calls to your Railway/Render backend domain if hosting APIs there.
- **Backend (Railway/Render/Fly):** deploy Docker image with services: Node app (Next server), `worker`, Postgres, Redis. Provide `DATABASE_URL` and `REDIS_URL` envs.
- Optionally keep UI and API together on the backend host; Vercel can proxy to it.