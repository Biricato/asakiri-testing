"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
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
import { createLesson, deleteLesson } from "../actions/lessons"
import type { UnitNode, Lesson } from "../types"

export function LessonList({
  courseId,
  unitId,
  nodes,
}: {
  courseId: string
  unitId: string
  nodes: (UnitNode & { lesson: Lesson | null })[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [newTitle, setNewTitle] = useState("")

  function handleCreate() {
    if (!newTitle.trim()) return
    startTransition(async () => {
      await createLesson(courseId, unitId, newTitle.trim())
      setNewTitle("")
      toast.success("Lesson created")
      router.refresh()
    })
  }

  function handleDelete(lessonId: string) {
    startTransition(async () => {
      await deleteLesson(lessonId)
      toast.success("Lesson deleted")
      router.refresh()
    })
  }

  const lessonNodes = nodes.filter((n) => n.type === "lesson" && n.lesson)

  return (
    <div className="space-y-2">
      {lessonNodes.length === 0 && (
        <p className="text-muted-foreground text-sm">No lessons yet.</p>
      )}
      {lessonNodes.map((n) => (
        <div
          key={n.id}
          className="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <Link
            href={`/create/${courseId}/lesson/${n.lesson!.id}`}
            className="flex items-center gap-2 hover:underline"
          >
            <span className="text-sm font-medium">{n.lesson!.title}</span>
            <Badge variant={n.lesson!.status === "published" ? "default" : "secondary"} className="text-xs">
              {n.lesson!.status}
            </Badge>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="ghost" size="icon-sm" disabled={pending} />}
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{n.lesson!.title}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the lesson and all its sections.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(n.lesson!.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <Input
          placeholder="New lesson..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="h-8 max-w-xs text-sm"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreate}
          disabled={!newTitle.trim() || pending}
        >
          <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
          Add
        </Button>
      </div>
    </div>
  )
}
