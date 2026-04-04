import { notFound } from "next/navigation"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson } from "@/schema/course"
import { lessonProgress } from "@/schema/learning"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getLessonContent } from "@/features/learn/actions/progress"
import { LessonViewer } from "@/features/learn/components/lesson-viewer"
import { PageHeader } from "@/components/page-header"

export default async function LessonLearningPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const rows = await db.select().from(lesson).where(eq(lesson.id, lessonId)).limit(1)
  const l = rows[0]
  if (!l || l.courseId !== courseId) notFound()

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const sections = await getLessonContent(lessonId)
  const progress = session
    ? await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, session.user.id), eq(lessonProgress.lessonId, lessonId))).limit(1)
    : []

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/learn/${courseId}`} label="Lesson" title={l.title} />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <LessonViewer lessonId={lessonId} sections={sections} isCompleted={progress.length > 0} />
        </div>
      </main>
    </div>
  )
}
