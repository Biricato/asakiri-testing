import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson, section } from "@/schema/course"
import { json, error, getSession, checkLessonPatreonGate } from "../../../helpers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const rows = await db.select().from(lesson).where(eq(lesson.id, id)).limit(1)
  if (!rows[0]) return error("Lesson not found", 404)

  // Check Patreon gate
  const session = await getSession(req)
  if (session) {
    const gate = await checkLessonPatreonGate(id, rows[0].courseId, session.user.id)
    if (gate) return gate
  }

  const sections = await db
    .select()
    .from(section)
    .where(eq(section.lessonId, id))
    .orderBy(section.order)

  return json({
    lesson: { id: rows[0].id, title: rows[0].title, courseId: rows[0].courseId },
    sections,
  })
}
