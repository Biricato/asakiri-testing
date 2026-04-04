"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
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
      toast.success("Item deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <Card key={item.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">
              {i + 1}. {item.word} — {item.meaning}
            </CardTitle>
            <div className="flex gap-1">
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button variant="ghost" size="icon-sm" disabled={pending} />}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete item?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete &quot;{item.word}&quot; and all its variants.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(item.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      ))}

      {showAdd ? (
        <Card>
          <CardContent className="pt-4">
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
                <Button type="submit" size="sm" disabled={pending}>
                  Add
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAdd(true)}>
          <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
          Add item
        </Button>
      )}
    </div>
  )
}
