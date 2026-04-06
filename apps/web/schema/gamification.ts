import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  boolean,
  date,
} from "drizzle-orm/pg-core"
import { user } from "./auth"

export const userStats = pgTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  gems: integer("gems").notNull().default(0),
  streakCount: integer("streak_count").notNull().default(0),
  streakFreezes: integer("streak_freezes").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  totalLessons: integer("total_lessons").notNull().default(0),
  totalExercises: integer("total_exercises").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
})

export const xpLog = pgTable("xp_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  gems: integer("gems").notNull().default(0),
  source: text("source").notNull(), // lesson_complete, exercise_complete, exercise_perfect, srs_review, daily_bonus, streak_milestone
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const achievement = pgTable("achievement", {
  id: text("id").primaryKey(), // e.g. "first_lesson", "streak_7"
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("star"),
  xpReward: integer("xp_reward").notNull().default(0),
  gemReward: integer("gem_reward").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const userAchievement = pgTable("user_achievement", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id")
    .notNull()
    .references(() => achievement.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
})
