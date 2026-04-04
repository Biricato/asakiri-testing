# Self-Hosting Asakiri

## Option 1: Vercel (Recommended)

One-click deploy with auto-provisioned Neon Postgres and Vercel Blob:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fasakiri&env=BETTER_AUTH_SECRET&envDescription=Generate%20with%3A%20openssl%20rand%20-base64%2032&stores=%5B%7B%22type%22%3A%22postgres%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D&root-directory=apps/web)

### Required environment variables

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Random secret for session signing. Generate with: `openssl rand -base64 32` |

### Auto-provisioned

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (auto-provisioned) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-provisioned) |

### Optional

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Gemini API key for AI exercise generation |

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

3. Run database migrations:
   ```bash
   cd apps/web
   bun run db:migrate
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
