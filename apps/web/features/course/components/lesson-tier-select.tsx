"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Select, ListBox } from "@heroui/react"
import { setLessonTier } from "../actions/patreon"
import type { PatreonTier } from "@/schema/patreon"

type Props = {
  lessonId: string
  tiers: PatreonTier[]
  currentTierId: string | null
}

export function LessonTierSelect({ lessonId, tiers, currentTierId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleChange(key: string) {
    startTransition(async () => {
      if (key === "free") {
        await setLessonTier(lessonId, null)
      } else {
        const tier = tiers.find((t) => t.id === key)
        if (tier) {
          await setLessonTier(lessonId, tier)
        }
      }
      router.refresh()
    })
  }

  return (
    <Select
      aria-label="Patreon tier"
      defaultSelectedKey={currentTierId ?? "free"}
      onSelectionChange={(keys) => {
        const key = keys ? Array.from(keys as Iterable<string>)[0] : undefined
        if (key) handleChange(key)
      }}
      isDisabled={pending}
      className="w-36"
    >
      <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
      <Select.Popover>
        <ListBox>
          <ListBox.Item id="free" textValue="Free">Free</ListBox.Item>
          {tiers.map((t) => (
            <ListBox.Item key={t.id} id={t.id} textValue={t.title}>
              {t.title} (${(t.amountCents / 100).toFixed(0)})
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
