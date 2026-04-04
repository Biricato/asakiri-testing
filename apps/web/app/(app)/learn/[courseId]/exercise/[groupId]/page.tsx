import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseGroup, exerciseVariant } from "@/schema/exercise"
import { ExercisePlayer } from "@/features/learn/components/exercise-player"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function ExerciseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string; groupId: string }>
}) {
  const { courseId, groupId } = await params

  const rows = await db
    .select()
    .from(exerciseGroup)
    .where(eq(exerciseGroup.id, groupId))
    .limit(1)
  const group = rows[0]
  if (!group || group.courseId !== courseId) notFound()

  const variants = await db
    .select({
      variantId: exerciseVariant.id,
      type: exerciseVariant.type,
      prompt: exerciseVariant.prompt,
      solution: exerciseVariant.solution,
    })
    .from(exerciseVariant)
    .where(eq(exerciseVariant.groupId, groupId))
    .orderBy(exerciseVariant.order)

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/learn/${courseId}`} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Practice
          </p>
          <h1 className="text-lg font-semibold">{group.title}</h1>
        </div>
      </div>

      <ExercisePlayer variants={variants} />
    </div>
  )
}
