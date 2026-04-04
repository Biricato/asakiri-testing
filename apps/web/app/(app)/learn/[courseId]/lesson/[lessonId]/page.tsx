import { notFound } from "next/navigation"
import Link from "next/link"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson } from "@/schema/course"
import { lessonProgress } from "@/schema/learning"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getLessonContent } from "@/features/learn/actions/progress"
import { LessonViewer } from "@/features/learn/components/lesson-viewer"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function LessonLearningPage({
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

  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  const sections = await getLessonContent(lessonId)

  const progress = session
    ? await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, session.user.id),
            eq(lessonProgress.lessonId, lessonId),
          ),
        )
        .limit(1)
    : []

  const isCompleted = progress.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center gap-3 px-6 py-3">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/learn/${courseId}`} />}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Button>
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Lesson
            </p>
            <h1 className="text-lg font-semibold">{l.title}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <LessonViewer
            lessonId={lessonId}
            sections={sections}
            isCompleted={isCompleted}
          />
        </div>
      </main>
    </div>
  )
}
