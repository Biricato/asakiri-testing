"use server"

import { eq, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson, section, unitNode } from "@/schema/course"
import type { Lesson } from "../types"

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

export async function createLesson(
  courseId: string,
  unitId: string,
  title: string,
): Promise<Lesson> {
  const slug = toSlug(title) || "untitled"

  // Insert lesson
  const rows = await db
    .insert(lesson)
    .values({ courseId, title, slug })
    .returning()
  const newLesson = rows[0]!

  // Auto-create unit node
  const [maxOrder] = await db
    .select({ max: max(unitNode.order) })
    .from(unitNode)
    .where(eq(unitNode.unitId, unitId))

  const nextOrder = (maxOrder?.max ?? -1) + 1

  await db.insert(unitNode).values({
    unitId,
    type: "lesson",
    lessonId: newLesson.id,
    order: nextOrder,
  })

  // Auto-create first empty section
  await db.insert(section).values({
    lessonId: newLesson.id,
    order: 0,
    content: null,
  })

  return newLesson
}

export async function updateLesson(
  lessonId: string,
  data: Partial<{ title: string; status: string }>,
): Promise<{ success: boolean }> {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }
  if (data.title) {
    updateData.slug = toSlug(data.title) || "untitled"
  }
  await db.update(lesson).set(updateData).where(eq(lesson.id, lessonId))
  return { success: true }
}

export async function deleteLesson(
  lessonId: string,
): Promise<{ success: boolean }> {
  // unitNode and sections cascade on delete
  await db.delete(lesson).where(eq(lesson.id, lessonId))
  return { success: true }
}
