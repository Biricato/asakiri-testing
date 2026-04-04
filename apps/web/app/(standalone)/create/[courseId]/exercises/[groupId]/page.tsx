import { notFound } from "next/navigation"
import { getExerciseGroup } from "@/features/exercise/actions/groups"
import { getItems } from "@/features/exercise/actions/items"
import { ItemEditor } from "@/features/exercise/components/item-editor"
import { PageHeader } from "@/components/page-header"

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
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/create/${courseId}`} label="Exercise Group" title={group.title} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          {group.description && <p className="text-muted-foreground mb-4">{group.description}</p>}
          <ItemEditor groupId={groupId} items={items} />
        </div>
      </main>
    </div>
  )
}
