"use server"

import { count, eq, or, ilike } from "drizzle-orm"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { user } from "@/schema/auth"
import type { PaginatedResult } from "../types"

type CourseWithCreator = typeof course.$inferSelect & {
  creatorName: string | null
}

export async function getAdminCourses({
  page = 1,
  search = "",
  pageSize = 20,
}: {
  page?: number
  search?: string
  pageSize?: number
}): Promise<PaginatedResult<CourseWithCreator>> {
  const offset = (page - 1) * pageSize

  const where = search
    ? or(
        ilike(course.title, `%${search}%`),
        ilike(course.targetLanguage, `%${search}%`),
      )
    : undefined

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        targetLanguage: course.targetLanguage,
        sourceLanguage: course.sourceLanguage,
        difficulty: course.difficulty,
        coverImageUrl: course.coverImageUrl,
        isPublished: course.isPublished,
        createdBy: course.createdBy,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        creatorName: user.name,
      })
      .from(course)
      .leftJoin(user, eq(course.createdBy, user.id))
      .where(where)
      .orderBy(course.createdAt)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(course).where(where),
  ])

  return {
    data: rows,
    total: totalResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

export async function togglePublish(
  courseId: string,
  isPublished: boolean,
): Promise<{ success: boolean }> {
  await db
    .update(course)
    .set({ isPublished, updatedAt: new Date() })
    .where(eq(course.id, courseId))
  return { success: true }
}

export async function deleteCourse(
  courseId: string,
): Promise<{ success: boolean }> {
  await db.delete(course).where(eq(course.id, courseId))
  return { success: true }
}
