import { notFound } from "next/navigation"
import Link from "next/link"
import { getExerciseGroup } from "@/features/exercise/actions/groups"
import { getItems } from "@/features/exercise/actions/items"
import { ItemEditor } from "@/features/exercise/components/item-editor"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function ExerciseGroupPage({
  params,
}: {
  params: Promise<{ courseId: string; groupId: string }>
}) {
  const { courseId, groupId } = await params
  const group = await getExerciseGroup(groupId)

  if (!group || group.courseId !== courseId) notFound()

  const items = await getItems(groupId)

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        render={<Link href={`/create/${courseId}`} />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back to course
      </Button>

      <h1 className="text-2xl font-bold">{group.title}</h1>
      {group.description && (
        <p className="text-muted-foreground mt-1">{group.description}</p>
      )}
      <p className="text-muted-foreground mt-1 text-sm">
        Dataset type: {group.datasetType}
      </p>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Items</h2>
        <ItemEditor groupId={groupId} items={items} />
      </div>
    </div>
  )
}
