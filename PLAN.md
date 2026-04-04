# Asakiri — Rebuild Plan

Self-hosted language learning course creator. One-click deploy on Vercel or Cloudflare. No Supabase, no Patreon. Admin-controlled access.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Database | Drizzle ORM + Neon Postgres |
| Auth | Better Auth (admin plugin, roles, Drizzle adapter) |
| Storage | Vercel Blob (S3-compatible fallback for self-hosting) |
| UI | shadcn/ui base-nova (58 components in `packages/ui`) |
| Data | React Server Components + Server Actions |

---

## Phases

### Phase 1: Foundation `[done]`
- [x] Install deps (drizzle-orm, better-auth, @neondatabase/serverless, @vercel/blob)
- [x] Drizzle schema — all tables (auth, course, exercise, learning, settings)
- [x] Better Auth config with admin plugin + first-user-becomes-admin hook
- [x] Lazy DB client (builds without DATABASE_URL)
- [x] Middleware (auth + role-based route protection)
- [x] Auth API route (`/api/auth/[...all]`)
- [x] Sign-in / sign-up pages
- [x] Landing page with session-aware nav
- [x] Authenticated app layout shell
- [x] Admin dashboard (placeholder)
- [x] drizzle.config.ts + db scripts + .env.example
- [x] Type-check + build passing

### Phase 2: Admin System
- [ ] Admin layout with sidebar nav
- [ ] **Platform settings page**
  - Registration mode: `open` | `invite_only`
  - Course creation: `open` | `approved` | `admin_only`
  - Default new user role
- [ ] **User management**
  - Paginated user table with search
  - Change role (admin / creator / learner)
  - Ban / unban users
- [ ] **Invite system**
  - Create invite (email + role + expiry)
  - Invite list with status (pending / used / expired)
  - Revoke invites
- [ ] **Course oversight**
  - All courses table
  - Unpublish / feature / remove

### Phase 3: Course Authoring
- [ ] **Course CRUD**
  - Create course (title, languages, difficulty)
  - Course list (my courses)
  - Course settings page (metadata, cover image)
  - Delete course
- [ ] **Unit management**
  - Create / rename / delete units
  - Drag-to-reorder units
- [ ] **Lesson management**
  - Create / rename / delete lessons within units
  - Lesson status (draft / published)
  - Auto-create unit_node on lesson create
- [ ] **Section editor (TipTap)**
  - Section list per lesson (reorderable)
  - TipTap rich text editor with:
    - Formatting (bold, italic, underline, headings, lists)
    - Images (upload to Vercel Blob)
    - Audio (upload + inline player)
    - Tables
    - YouTube embeds
    - Links
  - Auto-save (debounced server action)
- [ ] **Unit path nodes**
  - Ordered interleaving of lessons + exercise groups per unit
  - Drag-to-reorder
- [ ] **File upload**
  - Upload route (`/api/upload`)
  - Vercel Blob integration
  - Image validation (type, size)
  - Audio validation (type, size)

### Phase 4: Exercise System
- [ ] **Exercise group CRUD**
  - Create group (title, description, dataset type)
  - Link to unit via unit_node
  - Delete group
- [ ] **Exercise item editor**
  - Add items (word, meaning, part of speech, example sentence)
  - Reorder items
  - Edit / delete items
- [ ] **Variant editor** (4 types)
  - `word_cloze` — cloze text + hint + translation
  - `mcq` — stem + options (correct/incorrect)
  - `multi_blank` — template with blank slots + choice sets
  - `sentence_builder` — source tokens + target order + distractors
- [ ] **Exercise option management** (for MCQ / multi_blank)
  - Add / edit / delete / reorder options
  - Mark correct answer(s)
- [ ] **AI exercise generation** (optional, requires GEMINI_API_KEY)
  - API route: `/api/generate-exercises`
  - Gemini API call with section content as context
  - Auto-create items + variants from AI response
  - Supports all 4 variant types

### Phase 5: Publishing + Catalog
- [ ] **Publish course**
  - Server action creates `published_course` snapshot
  - Auto-generate slug from title
  - Version tracking (auto-increment)
  - Toggle `is_listed`
- [ ] **Public course catalog** (landing page)
  - Grid of listed courses with cover images
  - Filter by language / difficulty
  - Search
- [ ] **Public course detail page** (`/courses/[slug]`)
  - Course overview, unit structure, creator info
  - Enroll button
- [ ] **Enrollment flow**
  - If `open` enrollment: instant active enrollment
  - If `admin_managed`: creates pending enrollment, admin approves
  - Admin can revoke enrollments

### Phase 6: Learning Experience
- [ ] **Enrolled courses list** (`/learn`)
  - Cards showing progress per course
- [ ] **Course learning path** (`/learn/[courseId]`)
  - Units with ordered nodes (lessons + exercise groups)
  - Completion status per node
  - Progress indicator
- [ ] **Lesson viewer** (`/learn/[courseId]/lesson/[id]`)
  - Render TipTap content read-only (server-side via `generateHTML`)
  - Audio player for embedded audio
  - Mark complete on scroll to bottom
- [ ] **Exercise player** (`/learn/[courseId]/exercise/[id]`)
  - Variant components:
    - `WordCloze` — text input with hint
    - `MCQ` — radio/checkbox options
    - `MultiBlank` — inline dropdowns
    - `SentenceBuilder` — drag-to-arrange tokens
  - Submit → evaluate → show feedback (correct/incorrect + explanation)
  - Progress bar across variants
  - Session summary on completion (accuracy, time, XP)
- [ ] **Exercise session state machine**
  - Shuffle variants
  - Track current index, attempts, timer
  - Skip / continue / restart

### Phase 7: SRS + Progress
- [ ] **SM-2 spaced repetition algorithm**
  - Pure function: `computeSm2Update(state, isCorrect, durationMs) → newState`
  - Quality rating based on correctness + speed
  - Interval, easiness, repetition updates
- [ ] **Practice queue** (`/learn/[courseId]/practice`)
  - Fetch due variants (`srs_review.due_at <= now()`)
  - Ordered by most overdue first
  - "All caught up" state when empty
- [ ] **Practice session**
  - Same exercise player components
  - Submit → record attempt + update SRS state (single transaction)
  - Show next review date after each item
- [ ] **Lesson progress tracking**
  - Upsert `lesson_progress` on completion
  - Query completion status for learning path UI
- [ ] **Stats dashboard** (`/learn/stats` or per-course)
  - Lessons completed
  - Exercises attempted / accuracy
  - Items mastered (interval > N days)
  - Review streak
  - Charts (recharts)

### Phase 8: Deploy
- [ ] **Environment documentation**
  - `.env.example` with all vars `[done]`
  - `SELF_HOSTING.md` setup guide
- [ ] **Migration on deploy**
  - `postbuild` script runs `drizzle-kit migrate`
  - Seed default site_settings if empty
- [ ] **Vercel deploy button**
  - `vercel.json` with build config
  - Deploy URL with `stores=[{"type":"postgres"},{"type":"blob"}]`
  - Auto-provisions Neon + Blob
- [ ] **Docker Compose** (self-hosting)
  - `web` service (Next.js app)
  - `postgres` service (PostgreSQL 17)
  - `minio` service (S3-compatible storage, optional)
  - Volume for persistent data
- [ ] **Cloudflare** (alternative)
  - OpenNext adapter or static export
  - Neon via Hyperdrive
  - R2 for storage

---

## Data Model

### Auth (Better Auth + admin plugin)
```
user           id, name, email, email_verified, image, role, banned, ban_reason, ban_expires, created_at, updated_at
session        id, expires_at, token, ip_address, user_agent, user_id, impersonated_by, created_at, updated_at
account        id, account_id, provider_id, user_id, access_token, refresh_token, id_token, scope, password, created_at, updated_at
verification   id, identifier, value, expires_at, created_at, updated_at
```

### Platform
```
site_setting   key (PK), value, updated_at
invite         id, email, role, invited_by, code (unique), used_at, expires_at, created_at
```

### Course Authoring
```
course         id, title, subtitle, description (jsonb), target_language, source_language, difficulty, cover_image_url, is_published, created_by, created_at, updated_at
unit           id, course_id, title, order, created_at                          UNIQUE(course_id, order)
unit_node      id, unit_id, type, lesson_id?, exercise_group_id?, order         UNIQUE(unit_id, order)
lesson         id, course_id, title, slug, status, created_at, updated_at       UNIQUE(course_id, slug)
section        id, lesson_id, title, content (jsonb), order, created_at, updated_at
```

### Exercises
```
exercise_group          id, course_id, title, description, dataset_type, created_by, created_at
exercise_item           id, group_id, word, meaning, part_of_speech, example_sentence, order, created_at
exercise_variant        id, item_id, group_id, type, prompt (jsonb), solution (jsonb), difficulty, order, created_at
exercise_option         id, variant_id, label, value, is_correct, order
```

### Learning
```
published_course   id, course_id, slug (unique), version, is_listed, published_at
enrollment         id, published_course_id, user_id, status, enrolled_at
lesson_progress    user_id + lesson_id (PK), completed_at
exercise_attempt   id, user_id, variant_id, is_correct, duration_ms, answer (jsonb), submitted_at
srs_review         user_id + variant_id (PK), due_at, interval_days, easiness, repetition, last_reviewed_at
```

---

## Exercise Variant Types

### word_cloze
```json
{ "prompt": { "clozeText": "The ___ is red", "hint": "fruit", "translation": "...", "audioUrl": "...", "imageUrl": "..." },
  "solution": { "correctAnswer": "apple", "acceptedAlternatives": ["apples"], "explanation": "..." } }
```

### mcq
```json
{ "prompt": { "stem": "What does 'neko' mean?", "instructions": "...", "audioUrl": "...", "imageUrl": "..." },
  "solution": { "explanation": "...", "correctOptionId": "opt-1" } }
// + exercise_option rows: [{ label: "Cat", value: "cat", is_correct: true }, ...]
```

### multi_blank
```json
{ "prompt": { "template": "I {blank1} to the {blank2}", "instructions": "..." },
  "solution": { "blanks": [{ "key": "blank1", "correctAnswer": "went", "choices": ["went","go","gone"] }, ...] } }
```

### sentence_builder
```json
{ "prompt": { "sourceTokens": ["the","cat","sat"], "helperText": "Arrange in order" },
  "solution": { "targetTokens": ["the","cat","sat"], "distractorTokens": ["dog","ran"], "notes": "..." } }
```

---

## Environment Variables

```bash
DATABASE_URL=                    # Neon Postgres (auto-provisioned on Vercel)
BETTER_AUTH_SECRET=              # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=                # optional
GOOGLE_CLIENT_SECRET=            # optional
BLOB_READ_WRITE_TOKEN=           # Vercel Blob (auto-provisioned)
GEMINI_API_KEY=                  # optional — AI exercise generation
```

---

## Key Decisions

| Decision | Rationale |
|---|---|
| No lesson versioning | Old app had 3 levels of indirection (lesson → lesson_version → section → section_version). New design: direct content on lesson/section. Published course is a point-in-time reference. |
| Better Auth over Auth.js | Built-in admin plugin with roles/ban, TypeScript-first, simpler Drizzle integration |
| Server Actions over tRPC | Built into Next.js, no extra abstraction, type-safe enough |
| No separate teacher/learner tables | Single `user` table with `role` field. Simpler. |
| No Patreon | Replaced by admin-managed access control |
| Neon over Turso/D1 | Postgres — schema migrates 1:1, Vercel auto-provisions |
