import { notFound } from "next/navigation"
import { getExerciseGroup } from "@/features/exercise/actions/groups"
import { getItems } from "@/features/exercise/actions/items"
import { getCoursePatreonLink, getCourseTiers, getExerciseGroupTier } from "@/features/course/actions/patreon"
import { ItemEditor } from "@/features/exercise/components/item-editor"
import { PatreonTierCard } from "@/features/course/components/patreon-tier-card"
import { PageHeader } from "@/components/page-header"

export default async function ExerciseGroupPage({
  params,
}: {
  params: Promise<{ courseId: string; groupId: string }>
}) {
  const { courseId, groupId } = await params
  const group = await getExerciseGroup(groupId)
  if (!group || group.courseId !== courseId) notFound()

  const [items, patreonLink] = await Promise.all([
    getItems(groupId),
    getCoursePatreonLink(courseId).catch(() => null),
  ])

  let patreonTiers: { id: string; title: string; amountCents: number }[] = []
  let currentTier: { tierId: string } | null = null
  if (patreonLink) {
    ;[patreonTiers, currentTier] = await Promise.all([
      getCourseTiers(courseId),
      getExerciseGroupTier(groupId),
    ])
  }

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/create/${courseId}`} label="Exercise Group" title={group.title} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            {group.description && <p className="text-muted-foreground mb-4">{group.description}</p>}
            <ItemEditor groupId={groupId} items={items} />
          </div>
          {patreonLink && patreonTiers.length > 0 && (
            <PatreonTierCard
              type="exercise_group"
              id={groupId}
              tiers={patreonTiers}
              currentTierId={currentTier?.tierId ?? null}
            />
          )}
        </div>
      </main>
    </div>
  )
}
