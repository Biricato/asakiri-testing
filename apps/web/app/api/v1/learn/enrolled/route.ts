import { NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { enrollment, publishedCourse } from "@/schema/learning"
import { course } from "@/schema/course"
import { json, error, requireSession } from "../../helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)

    const courses = await db
      .select({
        enrollmentId: enrollment.id,
        publishedCourseId: enrollment.publishedCourseId,
        courseId: course.id,
        title: course.title,
        targetLanguage: course.targetLanguage,
        sourceLanguage: course.sourceLanguage,
        difficulty: course.difficulty,
        coverImageUrl: course.coverImageUrl,
        enrolledAt: enrollment.enrolledAt,
      })
      .from(enrollment)
      .innerJoin(publishedCourse, eq(enrollment.publishedCourseId, publishedCourse.id))
      .innerJoin(course, eq(publishedCourse.courseId, course.id))
      .where(
        and(
          eq(enrollment.userId, session.user.id),
          eq(enrollment.status, "active"),
        ),
      )

    return json({ courses })
  } catch {
    return error("Unauthorized", 401)
  }
}
