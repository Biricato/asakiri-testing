"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Card, Select, ListBox, Label } from "@heroui/react"
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

  function handleChange(key: string) {
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
          <Label>Required tier</Label>
          <Select
            aria-label="Patreon tier"
            defaultSelectedKey={currentTierId ?? "free"}
            isDisabled={pending}
            onSelectionChange={(keys) => {
              const key = keys ? Array.from(keys as Iterable<string>)[0] : undefined
              if (key) handleChange(key)
            }}
            className="w-full max-w-xs"
          >
            <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="free" textValue="Free (everyone)">Free (everyone)</ListBox.Item>
                {tiers.map((t) => (
                  <ListBox.Item key={t.id} id={t.id} textValue={`${t.title} ($${(t.amountCents / 100).toFixed(0)}/mo)`}>
                    {t.title} — ${(t.amountCents / 100).toFixed(0)}/mo
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </Card.Content>
    </Card>
  )
}
