import { getDueVariants } from "@/features/learn/actions/srs"
import { ExercisePlayer } from "@/features/learn/components/exercise-player"
import { PageHeader } from "@/components/page-header"

export default async function PracticePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const dueVariants = await getDueVariants(courseId)

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/learn/${courseId}`} label="Practice" title="Spaced Repetition" />
      <main className="flex-1">
        {dueVariants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground mt-1 text-sm">No items due for review right now.</p>
          </div>
        ) : (
          <ExercisePlayer variants={dueVariants} useSrs />
        )}
      </main>
    </div>
  )
}
