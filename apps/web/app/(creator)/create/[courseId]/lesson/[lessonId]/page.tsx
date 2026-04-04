import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { lesson } from "@/schema/course"
import { auth } from "@/lib/auth"
import { getCourse } from "@/features/course/actions/courses"
import { getSections } from "@/features/course/actions/sections"
import { SectionEditor } from "@/features/course/components/section-editor"
import { CreatorSidebar } from "@/features/course/components/creator-sidebar"
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

  const [course, sections, session] = await Promise.all([
    getCourse(courseId),
    getSections(lessonId),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])

  return (
    <div className="flex min-h-screen bg-background">
      <CreatorSidebar
        courseId={courseId}
        courseTitle={course?.title}
      />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/create/${courseId}`} />}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </Button>
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Lesson Editor
                </p>
                <h1 className="text-lg font-semibold">{l.title}</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-muted-foreground mb-6 text-sm">
              Edit lesson content. Changes are saved automatically.
            </p>
            <SectionEditor lessonId={lessonId} sections={sections} />
          </div>
        </main>
      </div>
    </div>
  )
}
