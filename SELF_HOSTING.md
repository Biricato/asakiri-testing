# Self-Hosting Asakiri

## Option 1: Vercel (Recommended)

### Deploy in 3 steps

1. **Fork** this repo — click the "Fork" button on [AsakiriLingo/asakiri](https://github.com/AsakiriLingo/asakiri)
2. **Import** your fork into Vercel at [vercel.com/new](https://vercel.com/new)
   - Set the root directory to `apps/web`
   - Add a Postgres store (Neon) and Blob store under **Storage**
   - Set the `BETTER_AUTH_SECRET` environment variable (generate with `openssl rand -base64 32`)
3. **Deploy** — Vercel builds and deploys automatically

### Updating

When new updates are released, go to your fork on GitHub and click **"Sync fork"** → **"Update branch"**. Vercel redeploys automatically.

No git commands needed.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | Session signing secret. Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | Auto | Neon Postgres (auto-provisioned via Vercel Storage) |
| `BLOB_READ_WRITE_TOKEN` | Auto | Vercel Blob (auto-provisioned via Vercel Storage) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GEMINI_API_KEY` | No | Gemini API key for AI exercise generation |

---

## Option 2: Docker Compose

### Prerequisites
- Docker and Docker Compose

### Steps

1. Clone the repo:
   ```bash
   git clone https://github.com/AsakiriLingo/asakiri.git
   cd asakiri
   ```

2. Create `.env` in the project root:
   ```bash
   BETTER_AUTH_SECRET=$(openssl rand -base64 32)
   # Optional:
   # GOOGLE_CLIENT_ID=
   # GOOGLE_CLIENT_SECRET=
   # GEMINI_API_KEY=
   ```

3. Start services:
   ```bash
   docker compose up -d
   ```

4. The app is running at `http://localhost:3000`.

5. The first user to sign up becomes admin.

### Updating

```bash
git pull
docker compose build
docker compose up -d
```

### Services

| Service | Port | Description |
|---|---|---|
| `web` | 3000 | Next.js application |
| `postgres` | 5432 | PostgreSQL 17 database |
| `minio` | 9000/9001 | S3-compatible storage (for file uploads) |

### File storage with MinIO

When self-hosting, replace Vercel Blob with MinIO:
- MinIO console: `http://localhost:9001` (user: `minioadmin`, pass: `minioadmin`)
- Create a bucket named `asakiri`
- Set `BLOB_READ_WRITE_TOKEN` to your MinIO credentials

### Data persistence

Database and MinIO data are stored in Docker volumes (`pgdata`, `miniodata`). They persist across container restarts.

### Backups

```bash
# Database backup
docker compose exec postgres pg_dump -U asakiri asakiri > backup.sql

# Restore
docker compose exec -i postgres psql -U asakiri asakiri < backup.sql
```

---

## Option 3: Manual deployment

### Requirements
- Node.js 20+ or Bun 1.3+
- PostgreSQL 15+
- S3-compatible storage (optional, for file uploads)

### Steps

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set environment variables (see `.env.example` in `apps/web/`).

3. Run database setup:
   ```bash
   cd apps/web
   bun run db:push
   bun run seed
   ```

4. Build and start:
   ```bash
   bun run build
   bun run start
   ```

---

## First-time setup

1. Navigate to the app in your browser.
2. Sign up — the first user automatically becomes **admin**.
3. Go to **Admin > Settings** to configure:
   - Registration mode (open or invite-only)
   - Course creation policy
   - Default user role
4. Go to **Create** to start building courses.
