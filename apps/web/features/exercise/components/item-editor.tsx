"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Card, Chip, AlertDialog } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons"
import { createItem, deleteItem } from "../actions/items"
import { createVariant } from "../actions/variants"
import { addOption } from "../actions/variants"
import { AddExerciseDialog } from "./add-exercise-dialog"
import type { ItemWithVariants } from "../types"

export function ItemEditor({
  groupId,
  items,
}: {
  groupId: string
  items: ItemWithVariants[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [deleteItemWord, setDeleteItemWord] = useState("")

  async function handleSave(payload: {
    type: string
    word: string
    meaning: string
    partOfSpeech: string
    exampleSentence: string
    prompt: Record<string, unknown>
    solution: Record<string, unknown>
    options?: { label: string; value: string; isCorrect: boolean }[]
  }) {
    // Create the item
    const item = await createItem(groupId, {
      word: payload.word || "Untitled",
      meaning: payload.meaning || "",
      partOfSpeech: payload.partOfSpeech || undefined,
      exampleSentence: payload.exampleSentence || undefined,
    })

    // Create the variant
    const variant = await createVariant(item.id, groupId, {
      type: payload.type as "word_cloze" | "mcq" | "multi_blank" | "sentence_builder",
      prompt: payload.prompt,
      solution: payload.solution,
    })

    // Create options for MCQ
    if (payload.type === "mcq" && payload.options) {
      for (const opt of payload.options) {
        await addOption(variant.id, opt)
      }
    }

    setDialogOpen(false)
    toast.success("Exercise added")
    router.refresh()
  }

  function handleDelete(itemId: string) {
    startTransition(async () => {
      await deleteItem(itemId)
      setDeleteItemId(null)
      toast.success("Exercise deleted")
      router.refresh()
    })
  }

  function formatType(type: string) {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  function previewContent(item: ItemWithVariants) {
    const v = item.variants[0]
    if (!v) return null
    const prompt = v.prompt as Record<string, unknown>
    const solution = v.solution as Record<string, unknown>

    switch (v.type) {
      case "word_cloze":
        return (
          <div className="text-muted text-xs space-y-0.5">
            <p>{String(prompt.clozeText ?? "")}</p>
            <p>Answer: <span className="text-foreground font-medium">{String(solution.correctAnswer ?? "")}</span></p>
          </div>
        )
      case "mcq":
        return (
          <div className="text-muted text-xs">
            <p>{String(prompt.stem ?? "")}</p>
          </div>
        )
      case "multi_blank":
        return (
          <div className="text-muted text-xs">
            <p>{String(prompt.template ?? "")}</p>
          </div>
        )
      case "sentence_builder": {
        const tokens = prompt.sourceTokens as string[] | undefined
        return (
          <div className="text-muted text-xs">
            <p>{tokens?.join(" ") ?? ""}</p>
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="text-muted text-sm">No exercises yet</p>
          <p className="text-muted mt-1 text-xs">Add your first exercise to get started.</p>
          <Button className="mt-4" onPress={() => setDialogOpen(true)}>
            Add exercise
          </Button>
        </div>
      ) : (
        <>
          {items.map((item, i) => (
            <Card key={item.id} className="flex-row items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent text-sm font-semibold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.word}</span>
                  {item.meaning && (
                    <span className="text-muted text-sm">— {item.meaning}</span>
                  )}
                </div>
                {item.variants[0] && (
                  <div className="mt-1 flex items-center gap-2">
                    <Chip variant="soft" className="text-xs">
                      {formatType(item.variants[0].type)}
                    </Chip>
                  </div>
                )}
                <div className="mt-1.5">{previewContent(item)}</div>
              </div>
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                isDisabled={pending}
                onPress={() => { setDeleteItemId(item.id); setDeleteItemWord(item.word) }}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </Button>
            </Card>
          ))}

          <Button variant="outline" onPress={() => setDialogOpen(true)} className="w-full">
            Add exercise
          </Button>
        </>
      )}

      <AddExerciseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        isSaving={pending}
      />

      <AlertDialog isOpen={!!deleteItemId} onOpenChange={(open) => { if (!open) setDeleteItemId(null) }}>
        <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header><AlertDialog.Heading>Delete exercise?</AlertDialog.Heading></AlertDialog.Header>
          <AlertDialog.Body><p>This will delete &quot;{deleteItemWord}&quot; and all its variants.</p></AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" slot="close">Cancel</Button>
            <Button variant="danger" onPress={() => deleteItemId && handleDelete(deleteItemId)}>Delete</Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  )
}
