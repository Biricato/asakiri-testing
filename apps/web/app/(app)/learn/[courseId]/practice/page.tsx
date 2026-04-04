import Link from "next/link"
import { getDueVariants } from "@/features/learn/actions/srs"
import { ExercisePlayer } from "@/features/learn/components/exercise-player"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function PracticePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const dueVariants = await getDueVariants(courseId)

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

      <h1 className="text-2xl font-bold">Practice</h1>
      <p className="text-muted-foreground mt-2">
        Review items due for spaced repetition.
      </p>

      <div className="mt-6 max-w-2xl">
        {dueVariants.length === 0 ? (
          <div className="text-muted-foreground rounded-md border p-6 text-center">
            <p className="text-lg font-medium">All caught up!</p>
            <p className="mt-1 text-sm">No items due for review right now.</p>
          </div>
        ) : (
          <ExercisePlayer variants={dueVariants} useSrs />
        )}
      </div>
    </div>
  )
}
