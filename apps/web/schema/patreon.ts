import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  unique,
} from "drizzle-orm/pg-core"
import { user } from "./auth"
import { course, lesson } from "./course"
import { exerciseGroup } from "./exercise"

// Creator's Patreon connection — one per user
export const patreonConnection = pgTable("patreon_connection", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  patreonUserId: text("patreon_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at"),
  campaignId: text("campaign_id"),
  // Cached tiers: [{ id, title, amountCents }]
  tiersCache: jsonb("tiers_cache").$type<PatreonTier[]>(),
  tiersCachedAt: timestamp("tiers_cached_at"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
})

// Learner's Patreon connection — for checking membership
export const patreonLearner = pgTable("patreon_learner", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  patreonUserId: text("patreon_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
})

// Links a course to the creator's Patreon campaign
export const coursePatreon = pgTable(
  "course_patreon",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("course_patreon_course").on(t.courseId)],
)

// Per-lesson tier requirement — null means free
export const lessonPatreonTier = pgTable(
  "lesson_patreon_tier",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    tierId: text("tier_id").notNull(),
    tierTitle: text("tier_title").notNull(),
    tierAmountCents: integer("tier_amount_cents").notNull().default(0),
  },
  (t) => [unique("lesson_patreon_tier_lesson").on(t.lessonId)],
)

// Per-exercise-group tier requirement — null means free
export const exerciseGroupPatreonTier = pgTable(
  "exercise_group_patreon_tier",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    exerciseGroupId: uuid("exercise_group_id")
      .notNull()
      .references(() => exerciseGroup.id, { onDelete: "cascade" }),
    tierId: text("tier_id").notNull(),
    tierTitle: text("tier_title").notNull(),
    tierAmountCents: integer("tier_amount_cents").notNull().default(0),
  },
  (t) => [unique("exercise_group_patreon_tier_group").on(t.exerciseGroupId)],
)

export type PatreonTier = {
  id: string
  title: string
  amountCents: number
}
