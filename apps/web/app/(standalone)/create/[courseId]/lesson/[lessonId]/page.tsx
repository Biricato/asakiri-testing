import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson } from "@/schema/course"
import { getSections } from "@/features/course/actions/sections"
import { SectionEditor } from "@/features/course/components/section-editor"
import { PageHeader } from "@/components/page-header"

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const rows = await db.select().from(lesson).where(eq(lesson.id, lessonId)).limit(1)
  const l = rows[0]
  if (!l || l.courseId !== courseId) notFound()

  const sections = await getSections(lessonId)

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/create/${courseId}`} label="Lesson Editor" title={l.title} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-muted-foreground mb-6 text-sm">Changes are saved automatically.</p>
          <SectionEditor lessonId={lessonId} sections={sections} />
        </div>
      </main>
    </div>
  )
}
