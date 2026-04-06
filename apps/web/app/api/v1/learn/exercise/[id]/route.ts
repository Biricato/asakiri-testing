import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseGroup, exerciseVariant, exerciseOption } from "@/schema/exercise"
import { json, error, getSession, checkExercisePatreonGate } from "../../../helpers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params

  const rows = await db.select().from(exerciseGroup).where(eq(exerciseGroup.id, groupId)).limit(1)
  if (!rows[0]) return error("Exercise group not found", 404)

  // Check Patreon gate
  const session = await getSession(req)
  if (session) {
    const gate = await checkExercisePatreonGate(groupId, rows[0].courseId, session.user.id)
    if (gate) return gate
  }

  const rawVariants = await db
    .select({
      variantId: exerciseVariant.id,
      type: exerciseVariant.type,
      prompt: exerciseVariant.prompt,
      solution: exerciseVariant.solution,
    })
    .from(exerciseVariant)
    .where(eq(exerciseVariant.groupId, groupId))
    .orderBy(exerciseVariant.order)

  const variants = await Promise.all(
    rawVariants.map(async (v) => {
      if (v.type === "mcq") {
        const opts = await db
          .select()
          .from(exerciseOption)
          .where(eq(exerciseOption.variantId, v.variantId))
          .orderBy(exerciseOption.order)
        return { ...v, options: opts.map((o) => ({ id: o.id, label: o.label, value: o.value, isCorrect: o.isCorrect })) }
      }
      return { ...v, options: undefined }
    }),
  )

  return json({ group: { id: rows[0].id, title: rows[0].title }, variants })
}
