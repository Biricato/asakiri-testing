import { notFound } from "next/navigation"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson, course } from "@/schema/course"
import { lessonProgress } from "@/schema/learning"
import { lessonPatreonTier, coursePatreon, patreonLearner } from "@/schema/patreon"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { checkLearnerMembership } from "@/lib/patreon"
import { getLessonContent } from "@/features/learn/actions/progress"
import { LessonViewer } from "@/features/learn/components/lesson-viewer"
import { PatreonGate } from "@/features/learn/components/patreon-gate"
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

  // Check Patreon tier gating
  const tierReq = await db
    .select()
    .from(lessonPatreonTier)
    .where(eq(lessonPatreonTier.lessonId, lessonId))
    .limit(1)

  if (tierReq[0] && session) {
    const cpRows = await db
      .select()
      .from(coursePatreon)
      .where(eq(coursePatreon.courseId, courseId))
      .limit(1)
    const campaignId = cpRows[0]?.campaignId

    if (campaignId) {
      // Check if learner has Patreon connected
      const learnerConn = await db
        .select()
        .from(patreonLearner)
        .where(eq(patreonLearner.userId, session.user.id))
        .limit(1)

      // Also check if user is the course creator (they always have access)
      const courseRow = await db
        .select({ createdBy: course.createdBy })
        .from(course)
        .where(eq(course.id, courseId))
        .limit(1)
      const isCreator = courseRow[0]?.createdBy === session.user.id

      if (!isCreator) {
        if (!learnerConn[0]) {
          return (
            <div className="flex min-h-svh flex-col">
              <PageHeader backHref={`/learn/${courseId}`} label="Lesson" title={l.title} />
              <main className="flex-1 px-4 py-8">
                <div className="mx-auto max-w-lg">
                  <PatreonGate
                    tierTitle={tierReq[0].tierTitle}
                    tierAmountCents={tierReq[0].tierAmountCents}
                    isConnected={false}
                    courseId={courseId}
                    lessonId={lessonId}
                  />
                </div>
              </main>
            </div>
          )
        }

        const membership = await checkLearnerMembership(session.user.id, campaignId)
        if (!membership.isMember || membership.tierAmountCents < tierReq[0].tierAmountCents) {
          return (
            <div className="flex min-h-svh flex-col">
              <PageHeader backHref={`/learn/${courseId}`} label="Lesson" title={l.title} />
              <main className="flex-1 px-4 py-8">
                <div className="mx-auto max-w-lg">
                  <PatreonGate
                    tierTitle={tierReq[0].tierTitle}
                    tierAmountCents={tierReq[0].tierAmountCents}
                    isConnected={true}
                    courseId={courseId}
                    lessonId={lessonId}
                  />
                </div>
              </main>
            </div>
          )
        }
      }
    }
  }

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
