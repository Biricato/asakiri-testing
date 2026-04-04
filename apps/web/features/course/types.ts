import type { course, unit, lesson, section, unitNode } from "@/schema/course"

export type Course = typeof course.$inferSelect
export type Unit = typeof unit.$inferSelect
export type Lesson = typeof lesson.$inferSelect
export type Section = typeof section.$inferSelect
export type UnitNode = typeof unitNode.$inferSelect

export type UnitWithLessons = Unit & {
  nodes: (UnitNode & { lesson: Lesson | null; exerciseGroupTitle: string | null })[]
}

export type CourseWithUnits = Course & {
  units: UnitWithLessons[]
}
