import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSetting } from "@/schema/settings"
import { course, unit, unitNode, lesson } from "@/schema/course"
import { exerciseGroup } from "@/schema/exercise"
import { lessonProgress } from "@/schema/learning"
import { lessonPatreonTier, exerciseGroupPatreonTier } from "@/schema/patreon"
import { json, error, requireSession } from "../../helpers"

// We store active course as a user-scoped setting: key = "active_course:{userId}"
function activeKey(userId: string) {
  return `active_course:${userId}`
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)

    const rows = await db
      .select()
      .from(siteSetting)
      .where(eq(siteSetting.key, activeKey(session.user.id)))
      .limit(1)

    const courseId = rows[0]?.value
    if (!courseId) return json({ active: null })

    const courseRows = await db
      .select()
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1)
    if (!courseRows[0]) return json({ active: null })

    const c = courseRows[0]

    // Build learning path
    const units = await db
      .select()
      .from(unit)
      .where(eq(unit.courseId, courseId))
      .orderBy(unit.order)

    const completedRows = await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, session.user.id))
    const completedIds = new Set(completedRows.map((r) => r.lessonId))

    const path = await Promise.all(
      units.map(async (u) => {
        const nodes = await db
          .select({
            id: unitNode.id,
            type: unitNode.type,
            lessonId: unitNode.lessonId,
            exerciseGroupId: unitNode.exerciseGroupId,
            order: unitNode.order,
          })
          .from(unitNode)
          .where(eq(unitNode.unitId, u.id))
          .orderBy(unitNode.order)

        const enriched = await Promise.all(
          nodes.map(async (n) => {
            let title = "Unknown"
            let completed = false
            let patreonTier: string | null = null

            if (n.type === "lesson" && n.lessonId) {
              const r = await db.select().from(lesson).where(eq(lesson.id, n.lessonId)).limit(1)
              title = r[0]?.title ?? "Untitled"
              completed = completedIds.has(n.lessonId)
              const t = await db.select().from(lessonPatreonTier).where(eq(lessonPatreonTier.lessonId, n.lessonId)).limit(1)
              patreonTier = t[0]?.tierTitle ?? null
            } else if (n.type === "exercise_group" && n.exerciseGroupId) {
              const r = await db.select().from(exerciseGroup).where(eq(exerciseGroup.id, n.exerciseGroupId)).limit(1)
              title = r[0]?.title ?? "Exercises"
              const t = await db.select().from(exerciseGroupPatreonTier).where(eq(exerciseGroupPatreonTier.exerciseGroupId, n.exerciseGroupId)).limit(1)
              patreonTier = t[0]?.tierTitle ?? null
            }

            return { ...n, title, completed, patreonTier }
          }),
        )

        return { id: u.id, title: u.title, order: u.order, nodes: enriched }
      }),
    )

    return json({
      active: {
        courseId: c.id,
        title: c.title,
        targetLanguage: c.targetLanguage,
        sourceLanguage: c.sourceLanguage,
        difficulty: c.difficulty,
        coverImageUrl: c.coverImageUrl,
        path,
      },
    })
  } catch {
    return error("Unauthorized", 401)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const { courseId } = await req.json()

    if (!courseId) return error("courseId required")

    const key = activeKey(session.user.id)
    const existing = await db
      .select()
      .from(siteSetting)
      .where(eq(siteSetting.key, key))
      .limit(1)

    if (existing.length > 0) {
      await db.update(siteSetting).set({ value: courseId, updatedAt: new Date() }).where(eq(siteSetting.key, key))
    } else {
      await db.insert(siteSetting).values({ key, value: courseId })
    }

    return json({ success: true })
  } catch {
    return error("Unauthorized", 401)
  }
}
