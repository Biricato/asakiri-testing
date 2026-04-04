"use server"

import { eq, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseVariant, exerciseOption } from "@/schema/exercise"
import type { ExerciseVariant, ExerciseOption, VariantType } from "../types"

export async function createVariant(
  itemId: string,
  groupId: string,
  data: {
    type: VariantType
    prompt: unknown
    solution: unknown
    difficulty?: number
  },
): Promise<ExerciseVariant> {
  const [maxOrder] = await db
    .select({ max: max(exerciseVariant.order) })
    .from(exerciseVariant)
    .where(eq(exerciseVariant.itemId, itemId))

  const nextOrder = (maxOrder?.max ?? -1) + 1

  const rows = await db
    .insert(exerciseVariant)
    .values({
      itemId,
      groupId,
      type: data.type,
      prompt: data.prompt,
      solution: data.solution,
      difficulty: data.difficulty ?? null,
      order: nextOrder,
    })
    .returning()

  return rows[0]!
}

export async function updateVariant(
  variantId: string,
  data: Partial<{
    prompt: unknown
    solution: unknown
    difficulty: number
  }>,
): Promise<{ success: boolean }> {
  await db
    .update(exerciseVariant)
    .set(data)
    .where(eq(exerciseVariant.id, variantId))
  return { success: true }
}

export async function deleteVariant(
  variantId: string,
): Promise<{ success: boolean }> {
  await db.delete(exerciseVariant).where(eq(exerciseVariant.id, variantId))
  return { success: true }
}

// Options management (for MCQ / multi_blank)
export async function addOption(
  variantId: string,
  data: { label: string; value: string; isCorrect: boolean },
): Promise<ExerciseOption> {
  const [maxOrder] = await db
    .select({ max: max(exerciseOption.order) })
    .from(exerciseOption)
    .where(eq(exerciseOption.variantId, variantId))

  const nextOrder = (maxOrder?.max ?? -1) + 1

  const rows = await db
    .insert(exerciseOption)
    .values({
      variantId,
      label: data.label,
      value: data.value,
      isCorrect: data.isCorrect,
      order: nextOrder,
    })
    .returning()

  return rows[0]!
}

export async function updateOption(
  optionId: string,
  data: Partial<{ label: string; value: string; isCorrect: boolean }>,
): Promise<{ success: boolean }> {
  await db
    .update(exerciseOption)
    .set(data)
    .where(eq(exerciseOption.id, optionId))
  return { success: true }
}

export async function deleteOption(
  optionId: string,
): Promise<{ success: boolean }> {
  await db.delete(exerciseOption).where(eq(exerciseOption.id, optionId))
  return { success: true }
}
