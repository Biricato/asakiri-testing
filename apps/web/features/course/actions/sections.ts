"use server"

import { eq, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { section } from "@/schema/course"
import type { Section } from "../types"

export async function getSections(lessonId: string): Promise<Section[]> {
  return db
    .select()
    .from(section)
    .where(eq(section.lessonId, lessonId))
    .orderBy(section.order)
}

export async function createSection(lessonId: string): Promise<Section> {
  const [maxOrder] = await db
    .select({ max: max(section.order) })
    .from(section)
    .where(eq(section.lessonId, lessonId))

  const nextOrder = (maxOrder?.max ?? -1) + 1

  const rows = await db
    .insert(section)
    .values({ lessonId, order: nextOrder, content: null })
    .returning()
  return rows[0]!
}

export async function deleteSection(
  sectionId: string,
): Promise<{ success: boolean }> {
  const rows = await db
    .select()
    .from(section)
    .where(eq(section.id, sectionId))
    .limit(1)
  const s = rows[0]
  if (!s) return { success: false }

  await db.delete(section).where(eq(section.id, sectionId))

  // Reorder remaining
  const remaining = await db
    .select()
    .from(section)
    .where(eq(section.lessonId, s.lessonId))
    .orderBy(section.order)

  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i]!.order !== i) {
      await db.update(section).set({ order: i }).where(eq(section.id, remaining[i]!.id))
    }
  }

  return { success: true }
}

export async function reorderSections(
  lessonId: string,
  sectionIds: string[],
): Promise<{ success: boolean }> {
  for (let i = 0; i < sectionIds.length; i++) {
    await db.update(section).set({ order: i }).where(eq(section.id, sectionIds[i]!))
  }
  return { success: true }
}

export async function updateSectionTitle(
  sectionId: string,
  title: string,
): Promise<{ success: boolean }> {
  await db
    .update(section)
    .set({ title, updatedAt: new Date() })
    .where(eq(section.id, sectionId))
  return { success: true }
}

export async function saveContent(
  sectionId: string,
  content: unknown,
): Promise<{ success: boolean }> {
  await db
    .update(section)
    .set({ content, updatedAt: new Date() })
    .where(eq(section.id, sectionId))
  return { success: true }
}
