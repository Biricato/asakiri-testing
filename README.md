# Asakiri

Self-hosted language learning platform. Create interactive courses with lessons, exercises, and spaced repetition. One-click deploy on Vercel.

## Features

- **Course creation** — rich text editor (TipTap) with images, audio, tables, YouTube embeds
- **4 exercise types** — word cloze, multiple choice, multi-blank, sentence builder
- **Spaced repetition** — SM-2 algorithm for long-term retention
- **Admin controls** — manage users, roles, registration mode, course creation policy
- **Course access control** — open, approval required, invite only, or external paywall (Patreon/Stripe via webhook)
- **Federation** — AT Protocol-inspired. Public API on every instance. Portable identity. Opt-in discovery.
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

### One-Click Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAsakiriLingo%2Fasakiri&env=BETTER_AUTH_SECRET,BETTER_AUTH_URL&envDescription=Auth%20secret%20and%20app%20URL&stores=[{"type":"postgres"},{"type":"blob"}])

Vercel auto-provisions Neon Postgres and Blob Storage. You just need to set:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres (auto-provisioned by Vercel) |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | Your app URL (e.g. `https://your-app.vercel.app`) |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob (auto-provisioned) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth |
| `GEMINI_API_KEY` | No | AI exercise generation |

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

## Course Access Control

Creators can set per-course access:

| Mode | Description |
|---|---|
| Open | Anyone can enroll |
| Approval | Learners request access, creator approves |
| Invite | Creator shares invite codes |
| External | Webhook-based (Patreon, Stripe, Ko-fi, etc.) |

For external paywalls, the creator gets a webhook URL to configure in their payment provider. When a subscriber pays, the webhook auto-grants enrollment.

## Federation

Asakiri uses an AT Protocol-inspired federation model:

- **Every instance exposes a public API** — courses are addressable by `at://instance/course/slug`
- **Identity is portable** — users have handles like `alok@learn.okinawan.org`
- **Content stays at origin** — no replication, clients fetch directly
- **Progress on user's PDS** — your learning data lives on your home instance
- **Opt-in discovery** — instances choose whether to appear in directories and which peers to feature
- **Account migration** — export your profile (enrollments, progress, SRS state) and import on another instance

See [PLAN.md](PLAN.md) for full federation architecture.

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

## License

MIT
