import { NextRequest } from "next/server"
import { json, error } from "../../helpers"
import { getCourseBySlug } from "@/features/publish/actions/catalog"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) return error("Course not found", 404)
  return json({ course })
}
