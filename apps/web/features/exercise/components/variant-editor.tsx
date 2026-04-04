"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input, Button, Label, Checkbox } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { updateVariant, addOption, updateOption, deleteOption } from "../actions/variants"
import type { ExerciseVariant, ExerciseOption } from "../types"

export function VariantEditor({
  variant,
  options,
}: {
  variant: ExerciseVariant
  options: ExerciseOption[]
}) {
  switch (variant.type) {
    case "word_cloze":
      return <WordClozeEditor variant={variant} />
    case "mcq":
      return <McqEditor variant={variant} options={options} />
    case "multi_blank":
      return <MultiBlankEditor variant={variant} />
    case "sentence_builder":
      return <SentenceBuilderEditor variant={variant} />
    default:
      return <p className="text-muted-foreground text-xs">Unknown variant type</p>
  }
}

function WordClozeEditor({ variant }: { variant: ExerciseVariant }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const prompt = variant.prompt as Record<string, string>
  const solution = variant.solution as Record<string, unknown>

  function save(field: "prompt" | "solution", key: string, value: string) {
    const current = field === "prompt" ? prompt : solution
    startTransition(async () => {
      await updateVariant(variant.id, {
        [field]: { ...current, [key]: value },
      })
      router.refresh()
    })
  }

  return (
    <div className="grid gap-2 text-xs">
      <div className="space-y-1">
        <Label className="text-xs">Cloze text (use ___ for blank)</Label>
        <Input
          defaultValue={prompt.clozeText ?? ""}
          onBlur={(e) => save("prompt", "clozeText", e.target.value)}
          className="h-7 text-xs"
          disabled={pending}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Hint</Label>
          <Input
            defaultValue={prompt.hint ?? ""}
            onBlur={(e) => save("prompt", "hint", e.target.value)}
            className="h-7 text-xs"
            disabled={pending}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Correct answer</Label>
          <Input
            defaultValue={(solution.correctAnswer as string) ?? ""}
            onBlur={(e) => save("solution", "correctAnswer", e.target.value)}
            className="h-7 text-xs"
            disabled={pending}
          />
        </div>
      </div>
    </div>
  )
}

function McqEditor({
  variant,
  options,
}: {
  variant: ExerciseVariant
  options: ExerciseOption[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const prompt = variant.prompt as Record<string, string>

  function saveStem(value: string) {
    startTransition(async () => {
      await updateVariant(variant.id, {
        prompt: { ...prompt, stem: value },
      })
      router.refresh()
    })
  }

  function handleAddOption() {
    startTransition(async () => {
      await addOption(variant.id, { label: "", value: "", isCorrect: false })
      router.refresh()
    })
  }

  function handleUpdateOption(optId: string, field: string, value: unknown) {
    startTransition(async () => {
      await updateOption(optId, { [field]: value })
      if (field === "isCorrect" && value === true) {
        // Update solution with correct option
        await updateVariant(variant.id, {
          solution: { ...variant.solution as object, correctOptionId: optId },
        })
      }
      router.refresh()
    })
  }

  function handleDeleteOption(optId: string) {
    startTransition(async () => {
      await deleteOption(optId)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2 text-xs">
      <div className="space-y-1">
        <Label className="text-xs">Question stem</Label>
        <Input
          defaultValue={prompt.stem ?? ""}
          onBlur={(e) => saveStem(e.target.value)}
          className="h-7 text-xs"
          disabled={pending}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Options</Label>
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-2">
            <Checkbox
              isSelected={opt.isCorrect}
              onChange={(checked) =>
                handleUpdateOption(opt.id, "isCorrect", checked === true)
              }
              isDisabled={pending}
            />
            <Input
              defaultValue={opt.label}
              onBlur={(e) => handleUpdateOption(opt.id, "label", e.target.value)}
              className="h-7 flex-1 text-xs"
              placeholder="Option label"
              disabled={pending}
            />
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              onPress={() => handleDeleteOption(opt.id)}
              isDisabled={pending}
            >
              <HugeiconsIcon icon={Delete02Icon} size={12} />
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="text-xs" onPress={handleAddOption} isDisabled={pending}>
          <HugeiconsIcon icon={Add01Icon} size={12} className="mr-1" />
          Add option
        </Button>
      </div>
    </div>
  )
}

function MultiBlankEditor({ variant }: { variant: ExerciseVariant }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const prompt = variant.prompt as Record<string, string>
  const solution = variant.solution as { blanks?: { key: string; correctAnswer: string; choices: string[] }[] }

  function saveTemplate(value: string) {
    startTransition(async () => {
      await updateVariant(variant.id, {
        prompt: { ...prompt, template: value },
      })
      router.refresh()
    })
  }

  function saveBlanks(blanks: { key: string; correctAnswer: string; choices: string[] }[]) {
    startTransition(async () => {
      await updateVariant(variant.id, {
        solution: { ...solution, blanks },
      })
      router.refresh()
    })
  }

  const blanks = solution.blanks ?? []

  return (
    <div className="space-y-2 text-xs">
      <div className="space-y-1">
        <Label className="text-xs">Template (use {"{blank1}"}, {"{blank2}"}, etc.)</Label>
        <Input
          defaultValue={prompt.template ?? ""}
          onBlur={(e) => saveTemplate(e.target.value)}
          className="h-7 text-xs"
          disabled={pending}
        />
      </div>
      {blanks.map((blank, i) => (
        <div key={blank.key} className="grid grid-cols-3 gap-1">
          <Input value={blank.key} disabled className="h-7 text-xs" />
          <Input
            defaultValue={blank.correctAnswer}
            placeholder="Correct answer"
            onBlur={(e) => {
              const updated = [...blanks]
              updated[i] = { ...blank, correctAnswer: e.target.value }
              saveBlanks(updated)
            }}
            className="h-7 text-xs"
            disabled={pending}
          />
          <Input
            defaultValue={blank.choices.join(", ")}
            placeholder="Choices (comma-separated)"
            onBlur={(e) => {
              const updated = [...blanks]
              updated[i] = {
                ...blank,
                choices: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              }
              saveBlanks(updated)
            }}
            className="h-7 text-xs"
            disabled={pending}
          />
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
        onPress={() => {
          saveBlanks([...blanks, { key: `blank${blanks.length + 1}`, correctAnswer: "", choices: [] }])
        }}
        isDisabled={pending}
      >
        <HugeiconsIcon icon={Add01Icon} size={12} className="mr-1" />
        Add blank
      </Button>
    </div>
  )
}

function SentenceBuilderEditor({ variant }: { variant: ExerciseVariant }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const prompt = variant.prompt as { sourceTokens?: string[]; helperText?: string }
  const solution = variant.solution as { targetTokens?: string[]; distractorTokens?: string[] }

  function save(field: "prompt" | "solution", data: Record<string, unknown>) {
    const current = field === "prompt" ? prompt : solution
    startTransition(async () => {
      await updateVariant(variant.id, {
        [field]: { ...current, ...data },
      })
      router.refresh()
    })
  }

  return (
    <div className="space-y-2 text-xs">
      <div className="space-y-1">
        <Label className="text-xs">Source tokens (comma-separated)</Label>
        <Input
          defaultValue={(prompt.sourceTokens ?? []).join(", ")}
          onBlur={(e) =>
            save("prompt", {
              sourceTokens: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          className="h-7 text-xs"
          disabled={pending}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Target tokens (correct order, comma-separated)</Label>
        <Input
          defaultValue={(solution.targetTokens ?? []).join(", ")}
          onBlur={(e) =>
            save("solution", {
              targetTokens: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          className="h-7 text-xs"
          disabled={pending}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Distractor tokens (comma-separated)</Label>
        <Input
          defaultValue={(solution.distractorTokens ?? []).join(", ")}
          onBlur={(e) =>
            save("solution", {
              distractorTokens: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          className="h-7 text-xs"
          disabled={pending}
        />
      </div>
    </div>
  )
}
