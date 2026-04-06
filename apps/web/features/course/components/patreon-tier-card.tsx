"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Card, Label } from "@heroui/react"
import { setLessonTier, setExerciseGroupTier } from "../actions/patreon"
import type { PatreonTier } from "@/schema/patreon"

type Props = {
  type: "lesson" | "exercise_group"
  id: string
  tiers: PatreonTier[]
  currentTierId: string | null
}

export function PatreonTierCard({ type, id, tiers, currentTierId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const key = e.target.value
    startTransition(async () => {
      const tier = key === "free" ? null : tiers.find((t) => t.id === key) ?? null
      if (type === "lesson") {
        await setLessonTier(id, tier)
      } else {
        await setExerciseGroupTier(id, tier)
      }
      toast.success(tier ? `Tier set to ${tier.title}` : "Set to free")
      router.refresh()
    })
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Patreon Access</Card.Title>
        <Card.Description>
          Require a Patreon tier to access this {type === "lesson" ? "lesson" : "exercise group"}.
          Free means everyone can access it.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="grid gap-1.5">
          <Label htmlFor="patreon-tier">Required tier</Label>
          <select
            id="patreon-tier"
            defaultValue={currentTierId ?? "free"}
            onChange={handleChange}
            disabled={pending}
            className="w-full max-w-xs rounded-lg border border-[var(--field-border)] bg-[var(--field-background)] px-3 py-2 text-sm text-[var(--field-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
          >
            <option value="free">Free (everyone)</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — ${(t.amountCents / 100).toFixed(0)}/mo
              </option>
            ))}
          </select>
        </div>
      </Card.Content>
    </Card>
  )
}
