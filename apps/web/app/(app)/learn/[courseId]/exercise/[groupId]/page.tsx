import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseGroup, exerciseVariant, exerciseOption } from "@/schema/exercise"
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
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        render={<Link href={`/learn/${courseId}`} />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back to course
      </Button>

      <h1 className="text-2xl font-bold">{group.title}</h1>
      {group.description && (
        <p className="text-muted-foreground mt-1">{group.description}</p>
      )}

      <div className="mt-6 max-w-2xl">
        <ExercisePlayer variants={variants} />
      </div>
    </div>
  )
}
