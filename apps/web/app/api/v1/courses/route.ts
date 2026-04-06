import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSetting } from "@/schema/settings"
import { json } from "../helpers"
import { getCatalog } from "@/features/publish/actions/catalog"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const courses = await getCatalog({
    search: searchParams.get("search") ?? "",
    difficulty: searchParams.get("difficulty") ?? "",
    language: searchParams.get("language") ?? "",
  })

  // Filter by mobile_courses setting if present
  const rows = await db
    .select()
    .from(siteSetting)
    .where(eq(siteSetting.key, "mobile_courses"))
    .limit(1)
    .catch(() => [])

  let filtered = courses
  try {
    const allowedSlugs: string[] = JSON.parse(rows[0]?.value ?? "[]")
    if (allowedSlugs.length > 0) {
      filtered = courses.filter((c) => allowedSlugs.includes(c.slug))
    }
  } catch {}

  return json({ courses: filtered })
}
