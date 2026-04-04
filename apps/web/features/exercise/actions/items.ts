"use server"

import { eq, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseItem, exerciseVariant, exerciseOption } from "@/schema/exercise"
import type { ItemWithVariants } from "../types"

export async function getItems(groupId: string): Promise<ItemWithVariants[]> {
  const items = await db
    .select()
    .from(exerciseItem)
    .where(eq(exerciseItem.groupId, groupId))
    .orderBy(exerciseItem.order)

  return Promise.all(
    items.map(async (item) => {
      const variants = await db
        .select()
        .from(exerciseVariant)
        .where(eq(exerciseVariant.itemId, item.id))
        .orderBy(exerciseVariant.order)

      const variantsWithOptions = await Promise.all(
        variants.map(async (v) => {
          const options = await db
            .select()
            .from(exerciseOption)
            .where(eq(exerciseOption.variantId, v.id))
            .orderBy(exerciseOption.order)
          return { ...v, options }
        }),
      )

      return { ...item, variants: variantsWithOptions }
    }),
  )
}

export async function createItem(
  groupId: string,
  data: {
    word: string
    meaning: string
    partOfSpeech?: string
    exampleSentence?: string
  },
): Promise<{ success: boolean }> {
  const [maxOrder] = await db
    .select({ max: max(exerciseItem.order) })
    .from(exerciseItem)
    .where(eq(exerciseItem.groupId, groupId))

  const nextOrder = (maxOrder?.max ?? -1) + 1

  await db.insert(exerciseItem).values({
    groupId,
    word: data.word,
    meaning: data.meaning,
    partOfSpeech: data.partOfSpeech ?? null,
    exampleSentence: data.exampleSentence ?? null,
    order: nextOrder,
  })

  return { success: true }
}

export async function updateItem(
  itemId: string,
  data: Partial<{
    word: string
    meaning: string
    partOfSpeech: string
    exampleSentence: string
  }>,
): Promise<{ success: boolean }> {
  await db.update(exerciseItem).set(data).where(eq(exerciseItem.id, itemId))
  return { success: true }
}

export async function deleteItem(itemId: string): Promise<{ success: boolean }> {
  await db.delete(exerciseItem).where(eq(exerciseItem.id, itemId))
  return { success: true }
}

export async function reorderItems(
  groupId: string,
  itemIds: string[],
): Promise<{ success: boolean }> {
  for (let i = 0; i < itemIds.length; i++) {
    await db
      .update(exerciseItem)
      .set({ order: i })
      .where(eq(exerciseItem.id, itemIds[i]!))
  }
  return { success: true }
}
