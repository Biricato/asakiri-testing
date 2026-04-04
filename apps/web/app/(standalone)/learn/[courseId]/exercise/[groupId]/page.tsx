import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseGroup, exerciseVariant } from "@/schema/exercise"
import { ExercisePlayer } from "@/features/learn/components/exercise-player"
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

  const variants = await db
    .select({ variantId: exerciseVariant.id, type: exerciseVariant.type, prompt: exerciseVariant.prompt, solution: exerciseVariant.solution })
    .from(exerciseVariant)
    .where(eq(exerciseVariant.groupId, groupId))
    .orderBy(exerciseVariant.order)

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/learn/${courseId}`} label="Practice" title={group.title} />
      <main className="flex-1">
        <ExercisePlayer variants={variants} />
      </main>
    </div>
  )
}
