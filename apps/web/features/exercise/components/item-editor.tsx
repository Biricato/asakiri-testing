"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Card, Chip, AlertDialog } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons"
import { createItem, updateItem, deleteItem } from "../actions/items"
import { createVariant, updateVariant, addOption, deleteOption } from "../actions/variants"
import { AddExerciseDialog, type InitialExerciseData } from "./add-exercise-dialog"
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
  const [editingItem, setEditingItem] = useState<ItemWithVariants | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [deleteItemWord, setDeleteItemWord] = useState("")

  const mode = editingItem ? "edit" : "create"

  function buildInitialData(item: ItemWithVariants): InitialExerciseData | null {
    const v = item.variants[0]
    if (!v) return null
    return {
      type: v.type as InitialExerciseData["type"],
      word: item.word,
      meaning: item.meaning,
      partOfSpeech: item.partOfSpeech ?? "",
      exampleSentence: item.exampleSentence ?? "",
      prompt: v.prompt as Record<string, unknown>,
      solution: v.solution as Record<string, unknown>,
      options: v.options?.map((o) => ({ id: o.id, label: o.label, isCorrect: o.isCorrect })),
    }
  }

  function openCreate() {
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item: ItemWithVariants) {
    setEditingItem(item)
    setDialogOpen(true)
  }

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
    if (editingItem) {
      // Update existing item
      await updateItem(editingItem.id, {
        word: payload.word || "Untitled",
        meaning: payload.meaning || "",
        partOfSpeech: payload.partOfSpeech || undefined,
        exampleSentence: payload.exampleSentence || undefined,
      })

      // Update variant
      const v = editingItem.variants[0]
      if (v) {
        await updateVariant(v.id, {
          prompt: payload.prompt,
          solution: payload.solution,
        })

        // Update MCQ options
        if (payload.type === "mcq") {
          // Delete old options
          for (const opt of v.options ?? []) {
            await deleteOption(opt.id)
          }
          // Create new options
          if (payload.options) {
            for (const opt of payload.options) {
              await addOption(v.id, opt)
            }
          }
        }
      }

      setDialogOpen(false)
      setEditingItem(null)
      toast.success("Exercise updated")
      router.refresh()
    } else {
      // Create new
      const item = await createItem(groupId, {
        word: payload.word || "Untitled",
        meaning: payload.meaning || "",
        partOfSpeech: payload.partOfSpeech || undefined,
        exampleSentence: payload.exampleSentence || undefined,
      })

      const variant = await createVariant(item.id, groupId, {
        type: payload.type as "word_cloze" | "mcq" | "multi_blank" | "sentence_builder",
        prompt: payload.prompt,
        solution: payload.solution,
      })

      if (payload.type === "mcq" && payload.options) {
        for (const opt of payload.options) {
          await addOption(variant.id, opt)
        }
      }

      setDialogOpen(false)
      toast.success("Exercise added")
      router.refresh()
    }
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
            {v.options && v.options.length > 0 && (
              <p className="mt-0.5">{v.options.length} options</p>
            )}
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
          <Button className="mt-4" onPress={openCreate}>
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
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  isIconOnly
                  size="sm"
                  isDisabled={pending}
                  onPress={() => openEdit(item)}
                >
                  <HugeiconsIcon icon={Edit02Icon} size={14} />
                </Button>
                <Button
                  variant="ghost"
                  isIconOnly
                  size="sm"
                  isDisabled={pending}
                  onPress={() => { setDeleteItemId(item.id); setDeleteItemWord(item.word) }}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              </div>
            </Card>
          ))}

          <Button variant="outline" onPress={openCreate} className="w-full">
            Add exercise
          </Button>
        </>
      )}

      <AddExerciseDialog
        key={editingItem?.id ?? "create"}
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) { setEditingItem(null) }; setDialogOpen(open) }}
        onSave={handleSave}
        isSaving={pending}
        mode={mode}
        initialData={editingItem ? buildInitialData(editingItem) : null}
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
