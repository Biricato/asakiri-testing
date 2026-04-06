import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { exerciseGroup, exerciseVariant, exerciseOption } from "@/schema/exercise"
import { exerciseGroupPatreonTier, coursePatreon, patreonLearner } from "@/schema/patreon"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { checkLearnerMembership } from "@/lib/patreon"
import { ExercisePlayer } from "@/features/learn/components/exercise-player"
import { PatreonGate } from "@/features/learn/components/patreon-gate"
import { PageHeader } from "@/components/page-header"

export default async function ExerciseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string; groupId: string }>
}) {
  const { courseId, groupId } = await params
  const rows = await db.select().from(exerciseGroup).where(eq(exerciseGroup.id, groupId)).limit(1)
  const group = rows[0]
  if (!group || group.courseId !== courseId) notFound()

  // Check Patreon tier gating
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const tierReq = await db
    .select()
    .from(exerciseGroupPatreonTier)
    .where(eq(exerciseGroupPatreonTier.exerciseGroupId, groupId))
    .limit(1)

  if (tierReq[0] && session) {
    const cpRows = await db.select().from(coursePatreon).where(eq(coursePatreon.courseId, courseId)).limit(1)
    const campaignId = cpRows[0]?.campaignId

    if (campaignId) {
      const courseRow = await db.select({ createdBy: course.createdBy }).from(course).where(eq(course.id, courseId)).limit(1)
      const isCreator = courseRow[0]?.createdBy === session.user.id

      if (!isCreator) {
        const learnerConn = await db.select().from(patreonLearner).where(eq(patreonLearner.userId, session.user.id)).limit(1)

        if (!learnerConn[0]) {
          return (
            <div className="flex min-h-svh flex-col">
              <PageHeader backHref={`/learn/${courseId}`} label="Practice" title={group.title} />
              <main className="flex-1 px-4 py-8">
                <div className="mx-auto max-w-lg">
                  <PatreonGate tierTitle={tierReq[0].tierTitle} tierAmountCents={tierReq[0].tierAmountCents} isConnected={false} courseId={courseId} lessonId={groupId} />
                </div>
              </main>
            </div>
          )
        }

        const membership = await checkLearnerMembership(session.user.id, campaignId)
        if (!membership.isMember || membership.tierAmountCents < tierReq[0].tierAmountCents) {
          return (
            <div className="flex min-h-svh flex-col">
              <PageHeader backHref={`/learn/${courseId}`} label="Practice" title={group.title} />
              <main className="flex-1 px-4 py-8">
                <div className="mx-auto max-w-lg">
                  <PatreonGate tierTitle={tierReq[0].tierTitle} tierAmountCents={tierReq[0].tierAmountCents} isConnected={true} courseId={courseId} lessonId={groupId} />
                </div>
              </main>
            </div>
          )
        }
      }
    }
  }

  const rawVariants = await db
    .select({
      variantId: exerciseVariant.id,
      type: exerciseVariant.type,
      prompt: exerciseVariant.prompt,
      solution: exerciseVariant.solution,
    })
    .from(exerciseVariant)
    .where(eq(exerciseVariant.groupId, groupId))
    .orderBy(exerciseVariant.order)

  // Fetch options for MCQ variants
  const variants = await Promise.all(
    rawVariants.map(async (v) => {
      if (v.type === "mcq") {
        const opts = await db
          .select()
          .from(exerciseOption)
          .where(eq(exerciseOption.variantId, v.variantId))
          .orderBy(exerciseOption.order)
        return { ...v, options: opts.map((o) => ({ id: o.id, label: o.label, value: o.value, isCorrect: o.isCorrect })) }
      }
      return { ...v, options: undefined }
    }),
  )

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/learn/${courseId}`} label="Practice" title={group.title} />
      <main className="flex-1">
        <ExercisePlayer variants={variants} />
      </main>
    </div>
  )
}
