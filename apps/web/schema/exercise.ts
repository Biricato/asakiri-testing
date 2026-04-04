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
import { course } from "./course"

export const exerciseGroup = pgTable("exercise_group", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  datasetType: text("dataset_type").notNull().default("word_pair"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const exerciseGroupRelations = relations(
  exerciseGroup,
  ({ one, many }) => ({
    course: one(course, {
      fields: [exerciseGroup.courseId],
      references: [course.id],
    }),
    creator: one(user, {
      fields: [exerciseGroup.createdBy],
      references: [user.id],
    }),
    items: many(exerciseItem),
  }),
)

export const exerciseItem = pgTable("exercise_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => exerciseGroup.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  partOfSpeech: text("part_of_speech"),
  exampleSentence: text("example_sentence"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const exerciseItemRelations = relations(
  exerciseItem,
  ({ one, many }) => ({
    group: one(exerciseGroup, {
      fields: [exerciseItem.groupId],
      references: [exerciseGroup.id],
    }),
    variants: many(exerciseVariant),
  }),
)

export const exerciseVariant = pgTable("exercise_variant", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => exerciseItem.id, { onDelete: "cascade" }),
  groupId: uuid("group_id")
    .notNull()
    .references(() => exerciseGroup.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // word_cloze | mcq | multi_blank | sentence_builder
  prompt: jsonb("prompt").notNull(),
  solution: jsonb("solution").notNull(),
  difficulty: integer("difficulty"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const exerciseVariantRelations = relations(
  exerciseVariant,
  ({ one, many }) => ({
    item: one(exerciseItem, {
      fields: [exerciseVariant.itemId],
      references: [exerciseItem.id],
    }),
    group: one(exerciseGroup, {
      fields: [exerciseVariant.groupId],
      references: [exerciseGroup.id],
    }),
    options: many(exerciseOption),
  }),
)

export const exerciseOption = pgTable("exercise_option", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => exerciseVariant.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  order: integer("order").notNull(),
})

export const exerciseOptionRelations = relations(exerciseOption, ({ one }) => ({
  variant: one(exerciseVariant, {
    fields: [exerciseOption.variantId],
    references: [exerciseVariant.id],
  }),
}))
