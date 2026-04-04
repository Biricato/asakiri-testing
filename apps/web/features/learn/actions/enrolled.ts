"use server"

import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { enrollment, publishedCourse } from "@/schema/learning"
import { course, unit, unitNode, lesson } from "@/schema/course"
import { exerciseGroup } from "@/schema/exercise"
import { lessonProgress } from "@/schema/learning"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { EnrolledCourse, LearningUnit } from "../types"

export async function getEnrolledCourses(): Promise<EnrolledCourse[]> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) return []

  const rows = await db
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

  return rows
}

export async function getLearningPath(
  courseId: string,
): Promise<LearningUnit[]> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) return []

  const units = await db
    .select()
    .from(unit)
    .where(eq(unit.courseId, courseId))
    .orderBy(unit.order)

  // Get user's completed lessons
  const progress = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, session.user.id))

  const completedLessonIds = new Set(progress.map((p) => p.lessonId))

  return Promise.all(
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

      const enrichedNodes = await Promise.all(
        nodes.map(async (n) => {
          let title = "Unknown"
          let completed = false

          if (n.type === "lesson" && n.lessonId) {
            const rows = await db
              .select()
              .from(lesson)
              .where(eq(lesson.id, n.lessonId))
              .limit(1)
            title = rows[0]?.title ?? "Untitled lesson"
            completed = completedLessonIds.has(n.lessonId)
          } else if (n.type === "exercise_group" && n.exerciseGroupId) {
            const rows = await db
              .select()
              .from(exerciseGroup)
              .where(eq(exerciseGroup.id, n.exerciseGroupId))
              .limit(1)
            title = rows[0]?.title ?? "Exercises"
          }

          return { ...n, title, completed }
        }),
      )

      return { id: u.id, title: u.title, order: u.order, nodes: enrichedNodes }
    }),
  )
}
