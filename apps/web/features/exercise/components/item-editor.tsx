"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, Label, Card, AlertDialog } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { createItem, updateItem, deleteItem } from "../actions/items"
import { VariantList } from "./variant-list"
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
  const [showAdd, setShowAdd] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [deleteItemWord, setDeleteItemWord] = useState("")

  function handleCreate(fd: FormData) {
    startTransition(async () => {
      await createItem(groupId, {
        word: fd.get("word") as string,
        meaning: fd.get("meaning") as string,
        partOfSpeech: (fd.get("partOfSpeech") as string) || undefined,
        exampleSentence: (fd.get("exampleSentence") as string) || undefined,
      })
      toast.success("Item added")
      setShowAdd(false)
      router.refresh()
    })
  }

  function handleUpdate(itemId: string, field: string, value: string) {
    startTransition(async () => {
      await updateItem(itemId, { [field]: value })
      router.refresh()
    })
  }

  function handleDelete(itemId: string) {
    startTransition(async () => {
      await deleteItem(itemId)
      setDeleteItemId(null)
      toast.success("Item deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <Card key={item.id}>
          <Card.Header className="flex-row items-center justify-between space-y-0 pb-2">
            <Card.Title className="text-sm">
              {i + 1}. {item.word} — {item.meaning}
            </Card.Title>
            <div className="flex gap-1">
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
          </Card.Header>
          <Card.Content className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                defaultValue={item.word}
                onBlur={(e) => {
                  if (e.target.value !== item.word)
                    handleUpdate(item.id, "word", e.target.value)
                }}
                placeholder="Word"
                className="h-8 text-sm"
              />
              <Input
                defaultValue={item.meaning}
                onBlur={(e) => {
                  if (e.target.value !== item.meaning)
                    handleUpdate(item.id, "meaning", e.target.value)
                }}
                placeholder="Meaning"
                className="h-8 text-sm"
              />
            </div>
            <VariantList itemId={item.id} groupId={groupId} variants={item.variants} />
          </Card.Content>
        </Card>
      ))}

      <AlertDialog isOpen={!!deleteItemId} onOpenChange={(open) => { if (!open) setDeleteItemId(null) }}>
        <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Heading>Delete item?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>This will delete &quot;{deleteItemWord}&quot; and all its variants.</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" slot="close">Cancel</Button>
            <Button variant="danger" onPress={() => deleteItemId && handleDelete(deleteItemId)}>Delete</Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
      </AlertDialog>

      {showAdd ? (
        <Card>
          <Card.Content className="pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCreate(new FormData(e.currentTarget))
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Word</Label>
                  <Input name="word" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Meaning</Label>
                  <Input name="meaning" required className="h-8 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input name="partOfSpeech" placeholder="Part of speech" className="h-8 text-sm" />
                <Input name="exampleSentence" placeholder="Example sentence" className="h-8 text-sm" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" isDisabled={pending}>
                  Add
                </Button>
                <Button type="button" variant="ghost" size="sm" onPress={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      ) : (
        <Button variant="outline" onPress={() => setShowAdd(true)}>
          <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
          Add item
        </Button>
      )}
    </div>
  )
}
