import { NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { lessonProgress } from "@/schema/learning"
import { json, error, requireSession } from "../../../../helpers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession(req)
    const { id: lessonId } = await params

    const existing = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, session.user.id),
          eq(lessonProgress.lessonId, lessonId),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      await db.insert(lessonProgress).values({
        userId: session.user.id,
        lessonId,
      })
    }

    return json({ success: true })
  } catch {
    return error("Unauthorized", 401)
  }
}
