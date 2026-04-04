# Asakiri

Self-hosted language learning platform. Create interactive courses with lessons, exercises, and spaced repetition. One-click deploy on Vercel.

## Features

- **Course creation** — rich text editor (TipTap) with images, audio, tables, YouTube embeds
- **4 exercise types** — word cloze, multiple choice, multi-blank, sentence builder
- **Spaced repetition** — SM-2 algorithm for long-term retention
- **Admin controls** — manage users, roles, registration mode, course creation policy
- **Course access control** — open, approval required, invite only, or external paywall (Patreon/Stripe via webhook)
- **Mobile app** — Expo React Native with HeroUI Native (setup ready)

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Drizzle ORM + PostgreSQL (Neon) |
| Auth | Better Auth (admin plugin, roles) |
| UI | HeroUI v3 (Tailwind CSS v4) |
| Storage | Vercel Blob |
| Mobile | Expo + HeroUI Native |

## Self-Hosting

> Full guide: [SELF_HOSTING.md](SELF_HOSTING.md)

### Vercel (Recommended)

1. **Fork** this repo — click "Fork" on [AsakiriLingo/asakiri](https://github.com/AsakiriLingo/asakiri)
2. **Import** your fork into Vercel at [vercel.com/new](https://vercel.com/new)
   - Set the root directory to `apps/web`
   - Add a **Postgres** store (Neon) and **Blob** store under Storage
   - Set the environment variables below
3. **Deploy** — Vercel builds and deploys automatically

To update: go to your fork on GitHub, click **"Sync fork"** → **"Update branch"**. Vercel redeploys automatically.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAsakiriLingo%2Fasakiri&env=BETTER_AUTH_SECRET,BETTER_AUTH_URL&envDescription=Auth%20secret%20and%20app%20URL&stores=[{"type":"postgres"},{"type":"blob"}])

| Variable | Required | Description |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | Session signing secret. Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | Auto | Neon Postgres (auto-provisioned via Vercel Storage) |
| `BLOB_READ_WRITE_TOKEN` | Auto | Vercel Blob (auto-provisioned via Vercel Storage) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GEMINI_API_KEY` | No | Gemini API key for AI exercise generation |

The first user to sign up becomes the **admin**.

### Docker Compose

```yaml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://asakiri:password@db:5432/asakiri
      BETTER_AUTH_SECRET: change-me-to-a-random-string
      BETTER_AUTH_URL: http://localhost:3000
    depends_on: [db]

  db:
    image: postgres:17
    environment:
      POSTGRES_DB: asakiri
      POSTGRES_USER: asakiri
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d
```

### Manual Setup

```bash
git clone https://github.com/AsakiriLingo/asakiri.git
cd asakiri
bun install
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your database URL and auth secret
cd apps/web
bun run db:push    # Push schema to database
bun run seed       # Seed default settings
bun run dev        # Start dev server
```

## Project Structure

```
apps/
  web/                  Next.js web app
    app/                Pages (App Router)
    features/           Feature modules (admin, course, exercise, learn, publish, tiptap)
    schema/             Drizzle ORM schema
    actions/            Server actions
    lib/                Auth, DB, storage clients
  mobile/               Expo React Native app (setup ready)

packages/
  eslint-config/        Shared ESLint configs
  typescript-config/    Shared TypeScript configs
```

## Admin

The first user to sign up automatically becomes the admin. Admin can:

- **Manage users** — change roles (admin/creator/learner), ban/unban
- **Control registration** — open or invite-only
- **Set course creation policy** — open (anyone), approved creators, or admin only
- **Manage invites** — create invite links with roles and expiry
- **Customize branding** — site name, tagline, hero text
- **Oversee courses** — view all courses, unpublish


## Development

```bash
bun install          # Install dependencies
bun run dev          # Start all apps in dev mode
bun run build        # Build all apps
bun run typecheck    # Type check
bun run lint         # Lint
```

### Database

```bash
cd apps/web
bun run db:push      # Push schema changes
bun run db:generate  # Generate migration files
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
```

