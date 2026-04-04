"use server"

import { eq, desc, count } from "drizzle-orm"
import { db } from "@/lib/db"
import { course, unit, unitNode, lesson } from "@/schema/course"
import { exerciseGroup } from "@/schema/exercise"
import { siteSetting } from "@/schema/settings"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { Course, CourseWithUnits } from "../types"

async function requireCreator() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  // Admin and creator roles always have access
  if (["admin", "creator"].includes(session.user.role ?? "")) {
    return session
  }

  // Check if course_creation is "open" — any authenticated user can create
  const rows = await db
    .select()
    .from(siteSetting)
    .where(eq(siteSetting.key, "course_creation"))
    .limit(1)
  const policy = rows[0]?.value ?? "open"

  if (policy === "open") {
    return session
  }

  throw new Error("Forbidden")
}

const PAGE_SIZE = 12

export async function getMyCourses({ page = 1 }: { page?: number } = {}): Promise<{
  courses: Course[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const session = await requireCreator()
  const offset = (page - 1) * PAGE_SIZE

  const [courses, totalResult] = await Promise.all([
    db
      .select()
      .from(course)
      .where(eq(course.createdBy, session.user.id))
      .orderBy(desc(course.updatedAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: count() })
      .from(course)
      .where(eq(course.createdBy, session.user.id)),
  ])

  const total = totalResult[0]?.count ?? 0

  return {
    courses,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
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
          exerciseGroupTitle: exerciseGroup.title,
        })
        .from(unitNode)
        .leftJoin(lesson, eq(unitNode.lessonId, lesson.id))
        .leftJoin(exerciseGroup, eq(unitNode.exerciseGroupId, exerciseGroup.id))
        .where(eq(unitNode.unitId, u.id))
        .orderBy(unitNode.order)

      return {
        ...u,
        nodes: nodes.map((n) => ({
          ...n,
          lesson: n.lesson?.id ? n.lesson : null,
          exerciseGroupTitle: n.exerciseGroupTitle,
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
