"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
import { Add01Icon, Delete02Icon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { createUnit, updateUnit, deleteUnit, reorderUnits } from "../actions/units"
import { LessonList } from "./lesson-list"
import type { UnitWithLessons } from "../types"

export function UnitList({
  courseId,
  units,
}: {
  courseId: string
  units: UnitWithLessons[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [newTitle, setNewTitle] = useState("")

  function handleCreate() {
    if (!newTitle.trim()) return
    startTransition(async () => {
      await createUnit(courseId, newTitle.trim())
      setNewTitle("")
      toast.success("Unit created")
      router.refresh()
    })
  }

  function handleRename(unitId: string, title: string) {
    startTransition(async () => {
      await updateUnit(unitId, title)
      router.refresh()
    })
  }

  function handleDelete(unitId: string) {
    startTransition(async () => {
      await deleteUnit(unitId)
      toast.success("Unit deleted")
      router.refresh()
    })
  }

  function handleMove(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= units.length) return

    const ids = units.map((u) => u.id)
    const [moved] = ids.splice(index, 1)
    ids.splice(newIndex, 0, moved!)

    startTransition(async () => {
      await reorderUnits(courseId, ids)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {units.map((u, i) => (
        <Card key={u.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-base"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent?.trim()
                if (text && text !== u.title) handleRename(u.id, text)
              }}
            >
              {u.title}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={i === 0 || pending}
                onClick={() => handleMove(i, -1)}
              >
                <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={i === units.length - 1 || pending}
                onClick={() => handleMove(i, 1)}
              >
                <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button variant="ghost" size="icon-sm" disabled={pending} />}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete unit &quot;{u.title}&quot;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All lessons in this unit will also be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(u.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <LessonList courseId={courseId} unitId={u.id} nodes={u.nodes} />
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder="New unit title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="max-w-xs"
        />
        <Button
          variant="outline"
          onClick={handleCreate}
          disabled={!newTitle.trim() || pending}
        >
          <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
          Add unit
        </Button>
      </div>
    </div>
  )
}
