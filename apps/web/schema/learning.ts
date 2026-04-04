import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  numeric,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth"
import { course, lesson } from "./course"
import { exerciseVariant } from "./exercise"

export const publishedCourse = pgTable("published_course", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  version: integer("version").notNull().default(1),
  isListed: boolean("is_listed").notNull().default(true),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
})

export const publishedCourseRelations = relations(
  publishedCourse,
  ({ one, many }) => ({
    course: one(course, {
      fields: [publishedCourse.courseId],
      references: [course.id],
    }),
    enrollments: many(enrollment),
  }),
)

export const enrollment = pgTable("enrollment", {
  id: uuid("id").primaryKey().defaultRandom(),
  publishedCourseId: uuid("published_course_id")
    .notNull()
    .references(() => publishedCourse.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // active | pending | revoked
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
})

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  publishedCourse: one(publishedCourse, {
    fields: [enrollment.publishedCourseId],
    references: [publishedCourse.id],
  }),
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
}))

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
)

export const exerciseAttempt = pgTable("exercise_attempt", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => exerciseVariant.id, { onDelete: "cascade" }),
  isCorrect: boolean("is_correct").notNull(),
  durationMs: integer("duration_ms"),
  answer: jsonb("answer"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
})

export const srsReview = pgTable(
  "srs_review",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => exerciseVariant.id, { onDelete: "cascade" }),
    dueAt: timestamp("due_at").notNull().defaultNow(),
    intervalDays: numeric("interval_days").notNull().default("1"),
    easiness: numeric("easiness").notNull().default("2.5"),
    repetition: integer("repetition").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.variantId] })],
)
