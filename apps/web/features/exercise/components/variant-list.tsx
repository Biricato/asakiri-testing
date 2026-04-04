"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Chip, Select, ListBox } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { createVariant, deleteVariant } from "../actions/variants"
import { VariantEditor } from "./variant-editor"
import type { ExerciseVariant, ExerciseOption, VariantType } from "../types"

export function VariantList({
  itemId,
  groupId,
  variants,
}: {
  itemId: string
  groupId: string
  variants: (ExerciseVariant & { options: ExerciseOption[] })[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [addType, setAddType] = useState<VariantType | null>(null)

  function handleCreate(type: VariantType) {
    const defaults: Record<VariantType, { prompt: unknown; solution: unknown }> = {
      word_cloze: {
        prompt: { clozeText: "", hint: "" },
        solution: { correctAnswer: "" },
      },
      mcq: {
        prompt: { stem: "" },
        solution: { correctOptionId: "", explanation: "" },
      },
      multi_blank: {
        prompt: { template: "" },
        solution: { blanks: [] },
      },
      sentence_builder: {
        prompt: { sourceTokens: [] },
        solution: { targetTokens: [] },
      },
    }

    startTransition(async () => {
      await createVariant(itemId, groupId, {
        type,
        ...defaults[type],
      })
      setAddType(null)
      toast.success("Variant added")
      router.refresh()
    })
  }

  function handleDelete(variantId: string) {
    startTransition(async () => {
      await deleteVariant(variantId)
      toast.success("Variant deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-2 border-t pt-2">
      <p className="text-muted-foreground text-xs font-medium">Variants</p>

      {variants.map((v) => (
        <div key={v.id} className="space-y-2 rounded-md border p-2">
          <div className="flex items-center justify-between">
            <Chip variant="secondary" className="text-xs">
              {v.type}
            </Chip>
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              onPress={() => handleDelete(v.id)}
              isDisabled={pending}
            >
              <HugeiconsIcon icon={Delete02Icon} size={12} />
            </Button>
          </div>
          <VariantEditor variant={v} options={v.options} />
        </div>
      ))}

      {addType ? (
        <div className="flex gap-2">
          <Select
            selectedKey={addType}
            onSelectionChange={(key) => key && setAddType(key as VariantType)}
            aria-label="Variant type"
            className="w-40"
          >
            <Select.Trigger className="h-8 text-xs"><Select.Value /><Select.Indicator /></Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="word_cloze" textValue="Word Cloze">Word Cloze</ListBox.Item>
                <ListBox.Item id="mcq" textValue="MCQ">MCQ</ListBox.Item>
                <ListBox.Item id="multi_blank" textValue="Multi Blank">Multi Blank</ListBox.Item>
                <ListBox.Item id="sentence_builder" textValue="Sentence Builder">Sentence Builder</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Button size="sm" onPress={() => handleCreate(addType)} isDisabled={pending}>
            Create
          </Button>
          <Button variant="ghost" size="sm" onPress={() => setAddType(null)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onPress={() => setAddType("word_cloze")}
        >
          <HugeiconsIcon icon={Add01Icon} size={12} className="mr-1" />
          Add variant
        </Button>
      )}
    </div>
  )
}
