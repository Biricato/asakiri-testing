import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  unique,
  uuid,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth"

export const course = pgTable("course", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: jsonb("description"),
  targetLanguage: text("target_language").notNull(),
  sourceLanguage: text("source_language").notNull(),
  difficulty: text("difficulty").notNull().default("beginner"),
  coverImageUrl: text("cover_image_url"),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const courseCollaborator = pgTable(
  "course_collaborator",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("editor"), // owner | editor | viewer
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
  },
  (t) => [unique("course_collaborator_unique").on(t.courseId, t.userId)],
)

export const courseCollaboratorRelations = relations(courseCollaborator, ({ one }) => ({
  course: one(course, {
    fields: [courseCollaborator.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [courseCollaborator.userId],
    references: [user.id],
  }),
}))

export const courseRelations = relations(course, ({ one, many }) => ({
  creator: one(user, {
    fields: [course.createdBy],
    references: [user.id],
  }),
  units: many(unit),
  collaborators: many(courseCollaborator),
}))

export const unit = pgTable(
  "unit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("unit_course_order").on(t.courseId, t.order)],
)

export const unitRelations = relations(unit, ({ one, many }) => ({
  course: one(course, {
    fields: [unit.courseId],
    references: [course.id],
  }),
  nodes: many(unitNode),
}))

export const lesson = pgTable(
  "lesson",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("lesson_course_slug").on(t.courseId, t.slug)],
)

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  course: one(course, {
    fields: [lesson.courseId],
    references: [course.id],
  }),
  sections: many(section),
}))

export const section = pgTable("section", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  title: text("title"),
  content: jsonb("content"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const sectionRelations = relations(section, ({ one }) => ({
  lesson: one(lesson, {
    fields: [section.lessonId],
    references: [lesson.id],
  }),
}))

export const unitNode = pgTable(
  "unit_node",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => unit.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "lesson" | "exercise_group"
    lessonId: uuid("lesson_id").references(() => lesson.id, {
      onDelete: "cascade",
    }),
    exerciseGroupId: uuid("exercise_group_id"), // FK added in exercise.ts
    order: integer("order").notNull(),
  },
  (t) => [unique("unit_node_order").on(t.unitId, t.order)],
)

export const unitNodeRelations = relations(unitNode, ({ one }) => ({
  unit: one(unit, {
    fields: [unitNode.unitId],
    references: [unit.id],
  }),
  lesson: one(lesson, {
    fields: [unitNode.lessonId],
    references: [lesson.id],
  }),
}))
