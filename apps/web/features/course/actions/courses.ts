"use server"

import { eq, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { course, unit, unitNode, lesson } from "@/schema/course"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { Course, CourseWithUnits } from "../types"

async function requireCreator() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")
  if (!["admin", "creator"].includes(session.user.role ?? "")) {
    throw new Error("Forbidden")
  }
  return session
}

export async function getMyCourses(): Promise<Course[]> {
  const session = await requireCreator()
  return db
    .select()
    .from(course)
    .where(eq(course.createdBy, session.user.id))
    .orderBy(desc(course.updatedAt))
}

export async function createCourse(data: {
  title: string
  targetLanguage: string
  sourceLanguage: string
  difficulty: string
}): Promise<Course> {
  const session = await requireCreator()
  const rows = await db
    .insert(course)
    .values({
      title: data.title,
      targetLanguage: data.targetLanguage,
      sourceLanguage: data.sourceLanguage,
      difficulty: data.difficulty,
      createdBy: session.user.id,
    })
    .returning()
  return rows[0]!
}

export async function getCourse(courseId: string): Promise<CourseWithUnits | null> {
  const session = await requireCreator()

  const rows = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)

  const c = rows[0]
  if (!c) return null
  if (c.createdBy !== session.user.id && session.user.role !== "admin") return null

  const units = await db
    .select()
    .from(unit)
    .where(eq(unit.courseId, courseId))
    .orderBy(unit.order)

  const unitsWithLessons = await Promise.all(
    units.map(async (u) => {
      const nodes = await db
        .select({
          id: unitNode.id,
          unitId: unitNode.unitId,
          type: unitNode.type,
          lessonId: unitNode.lessonId,
          exerciseGroupId: unitNode.exerciseGroupId,
          order: unitNode.order,
          lesson: {
            id: lesson.id,
            courseId: lesson.courseId,
            title: lesson.title,
            slug: lesson.slug,
            status: lesson.status,
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt,
          },
        })
        .from(unitNode)
        .leftJoin(lesson, eq(unitNode.lessonId, lesson.id))
        .where(eq(unitNode.unitId, u.id))
        .orderBy(unitNode.order)

      return {
        ...u,
        nodes: nodes.map((n) => ({
          ...n,
          lesson: n.lesson?.id ? n.lesson : null,
        })),
      }
    }),
  )

  return { ...c, units: unitsWithLessons }
}

export async function updateCourse(
  courseId: string,
  data: Partial<{
    title: string
    subtitle: string
    description: unknown
    targetLanguage: string
    sourceLanguage: string
    difficulty: string
    coverImageUrl: string
  }>,
): Promise<{ success: boolean }> {
  const session = await requireCreator()

  const rows = await db.select().from(course).where(eq(course.id, courseId)).limit(1)
  const c = rows[0]
  if (!c || (c.createdBy !== session.user.id && session.user.role !== "admin")) {
    throw new Error("Forbidden")
  }

  await db
    .update(course)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(course.id, courseId))
  return { success: true }
}

export async function deleteCourse(courseId: string): Promise<{ success: boolean }> {
  const session = await requireCreator()

  const rows = await db.select().from(course).where(eq(course.id, courseId)).limit(1)
  const c = rows[0]
  if (!c || (c.createdBy !== session.user.id && session.user.role !== "admin")) {
    throw new Error("Forbidden")
  }

  await db.delete(course).where(eq(course.id, courseId))
  return { success: true }
}
