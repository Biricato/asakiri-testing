import { NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { enrollment } from "@/schema/learning"
import { json, error, requireSession } from "../../../helpers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession(req)
    const { id: publishedCourseId } = await params

    const existing = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.publishedCourseId, publishedCourseId),
          eq(enrollment.userId, session.user.id),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      return json({ success: true, status: existing[0]!.status })
    }

    const rows = await db
      .insert(enrollment)
      .values({
        publishedCourseId,
        userId: session.user.id,
        status: "active",
      })
      .returning()

    return json({ success: true, status: rows[0]!.status })
  } catch {
    return error("Unauthorized", 401)
  }
}
