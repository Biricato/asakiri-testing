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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/create/${courseId}`} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Lesson Editor
          </p>
          <h1 className="text-lg font-semibold">{l.title}</h1>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        <p className="text-muted-foreground mb-6 text-sm">
          Changes are saved automatically.
        </p>
        <SectionEditor lessonId={lessonId} sections={sections} />
      </div>
    </div>
  )
}
