"use server"

import { eq, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { unit } from "@/schema/course"
import type { Unit } from "../types"

export async function createUnit(
  courseId: string,
  title: string,
): Promise<Unit> {
  const [maxOrder] = await db
    .select({ max: max(unit.order) })
    .from(unit)
    .where(eq(unit.courseId, courseId))

  const nextOrder = (maxOrder?.max ?? -1) + 1

  const rows = await db
    .insert(unit)
    .values({ courseId, title, order: nextOrder })
    .returning()
  return rows[0]!
}

export async function updateUnit(
  unitId: string,
  title: string,
): Promise<{ success: boolean }> {
  await db.update(unit).set({ title }).where(eq(unit.id, unitId))
  return { success: true }
}

export async function deleteUnit(unitId: string): Promise<{ success: boolean }> {
  const rows = await db.select().from(unit).where(eq(unit.id, unitId)).limit(1)
  const u = rows[0]
  if (!u) return { success: false }

  await db.delete(unit).where(eq(unit.id, unitId))

  // Reorder remaining units
  const remaining = await db
    .select()
    .from(unit)
    .where(eq(unit.courseId, u.courseId))
    .orderBy(unit.order)

  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i]!.order !== i) {
      await db.update(unit).set({ order: i }).where(eq(unit.id, remaining[i]!.id))
    }
  }

  return { success: true }
}

export async function reorderUnits(
  courseId: string,
  unitIds: string[],
): Promise<{ success: boolean }> {
  // Set all to negative first to avoid unique constraint violations
  for (let i = 0; i < unitIds.length; i++) {
    await db.update(unit).set({ order: -(i + 1000) }).where(eq(unit.id, unitIds[i]!))
  }
  // Then set to correct order
  for (let i = 0; i < unitIds.length; i++) {
    await db.update(unit).set({ order: i }).where(eq(unit.id, unitIds[i]!))
  }
  return { success: true }
}
