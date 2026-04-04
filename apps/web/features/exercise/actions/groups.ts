"use server"

import { eq, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseGroup } from "@/schema/exercise"
import { unitNode } from "@/schema/course"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { ExerciseGroup } from "../types"

export async function createExerciseGroup(
  courseId: string,
  unitId: string,
  data: { title: string; description?: string; datasetType?: string },
): Promise<ExerciseGroup> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  const rows = await db
    .insert(exerciseGroup)
    .values({
      courseId,
      title: data.title,
      description: data.description ?? null,
      datasetType: data.datasetType ?? "word_pair",
      createdBy: session.user.id,
    })
    .returning()

  const group = rows[0]!

  // Auto-create unit node
  const [maxOrder] = await db
    .select({ max: max(unitNode.order) })
    .from(unitNode)
    .where(eq(unitNode.unitId, unitId))

  const nextOrder = (maxOrder?.max ?? -1) + 1

  await db.insert(unitNode).values({
    unitId,
    type: "exercise_group",
    exerciseGroupId: group.id,
    order: nextOrder,
  })

  return group
}

export async function getExerciseGroup(
  groupId: string,
): Promise<ExerciseGroup | null> {
  const rows = await db
    .select()
    .from(exerciseGroup)
    .where(eq(exerciseGroup.id, groupId))
    .limit(1)
  return rows[0] ?? null
}

export async function deleteExerciseGroup(
  groupId: string,
): Promise<{ success: boolean }> {
  await db.delete(exerciseGroup).where(eq(exerciseGroup.id, groupId))
  return { success: true }
}
