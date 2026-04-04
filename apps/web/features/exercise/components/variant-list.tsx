"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
            <Badge variant="secondary" className="text-xs">
              {v.type}
            </Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(v.id)}
              disabled={pending}
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
            value={addType}
            onValueChange={(v) => v && setAddType(v as VariantType)}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="word_cloze">Word Cloze</SelectItem>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="multi_blank">Multi Blank</SelectItem>
              <SelectItem value="sentence_builder">Sentence Builder</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => handleCreate(addType)} disabled={pending}>
            Create
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAddType(null)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setAddType("word_cloze")}
        >
          <HugeiconsIcon icon={Add01Icon} size={12} className="mr-1" />
          Add variant
        </Button>
      )}
    </div>
  )
}
