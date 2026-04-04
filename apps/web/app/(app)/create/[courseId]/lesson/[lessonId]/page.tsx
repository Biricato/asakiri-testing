import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson } from "@/schema/course"
import { getSections } from "@/features/course/actions/sections"
import { SectionEditor } from "@/features/course/components/section-editor"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params

  const rows = await db
    .select()
    .from(lesson)
    .where(eq(lesson.id, lessonId))
    .limit(1)

  const l = rows[0]
  if (!l || l.courseId !== courseId) notFound()

  const sections = await getSections(lessonId)

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        render={<Link href={`/create/${courseId}`} />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back to course
      </Button>

      <h1 className="text-2xl font-bold">{l.title}</h1>
      <p className="text-muted-foreground mt-2">
        Edit lesson content. Changes are saved automatically.
      </p>

      <div className="mt-6">
        <SectionEditor lessonId={lessonId} sections={sections} />
      </div>
    </div>
  )
}
