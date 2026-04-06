import { NextRequest } from "next/server"
import { eq, and, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { srsReview } from "@/schema/learning"
import { exerciseVariant, exerciseGroup } from "@/schema/exercise"
import { json, error, requireSession } from "../../helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const courseId = req.nextUrl.searchParams.get("courseId")

    let condition = and(
      eq(srsReview.userId, session.user.id),
      sql`${srsReview.dueAt} <= now()`,
    )

    const dueItems = await db
      .select({
        variantId: srsReview.variantId,
        dueAt: srsReview.dueAt,
        intervalDays: srsReview.intervalDays,
        repetition: srsReview.repetition,
        type: exerciseVariant.type,
        prompt: exerciseVariant.prompt,
        solution: exerciseVariant.solution,
        groupId: exerciseVariant.groupId,
      })
      .from(srsReview)
      .innerJoin(exerciseVariant, eq(srsReview.variantId, exerciseVariant.id))
      .where(condition)
      .limit(50)

    // Filter by courseId if provided
    let items = dueItems
    if (courseId) {
      const groupIds = await db
        .select({ id: exerciseGroup.id })
        .from(exerciseGroup)
        .where(eq(exerciseGroup.courseId, courseId))
      const groupIdSet = new Set(groupIds.map((g) => g.id))
      items = dueItems.filter((i) => groupIdSet.has(i.groupId))
    }

    return json({ items })
  } catch {
    return error("Unauthorized", 401)
  }
}
