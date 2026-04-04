"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { unitNode } from "@/schema/course"
import { exerciseGroup } from "@/schema/exercise"

export async function reorderNodes(
  unitId: string,
  nodeIds: string[],
): Promise<{ success: boolean }> {
  // Set all to negative first to avoid unique constraint violations
  for (let i = 0; i < nodeIds.length; i++) {
    await db.update(unitNode).set({ order: -(i + 1000) }).where(eq(unitNode.id, nodeIds[i]!))
  }
  for (let i = 0; i < nodeIds.length; i++) {
    await db.update(unitNode).set({ order: i }).where(eq(unitNode.id, nodeIds[i]!))
  }
  return { success: true }
}

export async function deleteNode(
  nodeId: string,
): Promise<{ success: boolean }> {
  const rows = await db.select().from(unitNode).where(eq(unitNode.id, nodeId)).limit(1)
  const node = rows[0]
  if (!node) return { success: false }

  // Delete the node
  await db.delete(unitNode).where(eq(unitNode.id, nodeId))

  // If it's an exercise group, delete the group too
  if (node.type === "exercise_group" && node.exerciseGroupId) {
    await db.delete(exerciseGroup).where(eq(exerciseGroup.id, node.exerciseGroupId))
  }

  // Reorder remaining nodes
  const remaining = await db
    .select()
    .from(unitNode)
    .where(eq(unitNode.unitId, node.unitId))
    .orderBy(unitNode.order)

  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i]!.order !== i) {
      await db.update(unitNode).set({ order: i }).where(eq(unitNode.id, remaining[i]!.id))
    }
  }

  return { success: true }
}
