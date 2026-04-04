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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/create/${courseId}`} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Exercise Group
          </p>
          <h1 className="text-lg font-semibold">{group.title}</h1>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        {group.description && (
          <p className="text-muted-foreground mb-4">{group.description}</p>
        )}
        <ItemEditor groupId={groupId} items={items} />
      </div>
    </div>
  )
}
