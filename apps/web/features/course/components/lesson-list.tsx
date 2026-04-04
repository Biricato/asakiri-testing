"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@heroui/react"
import { Button, Input, Chip, AlertDialog } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { createLesson, deleteLesson } from "../actions/lessons"
import { CreateExerciseGroupDialog } from "@/features/exercise/components/exercise-group-panel"
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
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)
  const [deleteLessonTitle, setDeleteLessonTitle] = useState("")

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
      setDeleteLessonId(null)
      toast.success("Lesson deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      {nodes.length === 0 && (
        <p className="text-muted-foreground text-sm">No content yet.</p>
      )}
      {nodes.map((n) => {
        if (n.type === "lesson" && n.lesson) {
          return (
            <div
              key={n.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <Link
                href={`/create/${courseId}/lesson/${n.lesson.id}`}
                className="flex items-center gap-2 hover:underline"
              >
                <span className="text-sm font-medium">{n.lesson.title}</span>
                <Chip variant={n.lesson.status === "published" ? "primary" : "secondary"} className="text-xs">
                  {n.lesson.status}
                </Chip>
              </Link>
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                isDisabled={pending}
                onPress={() => { setDeleteLessonId(n.lesson!.id); setDeleteLessonTitle(n.lesson!.title) }}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </Button>
            </div>
          )
        }

        if (n.type === "exercise_group" && n.exerciseGroupId) {
          return (
            <div
              key={n.id}
              className="flex items-center justify-between rounded-md border border-dashed px-3 py-2"
            >
              <Link
                href={`/create/${courseId}/exercises/${n.exerciseGroupId}`}
                className="flex items-center gap-2 hover:underline"
              >
                <Chip variant="secondary" className="text-xs">Exercises</Chip>
                <span className="text-muted-foreground text-sm">Exercise group</span>
              </Link>
            </div>
          )
        }

        return null
      })}

      <AlertDialog isOpen={!!deleteLessonId} onOpenChange={(open) => { if (!open) setDeleteLessonId(null) }}>
        <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Heading>Delete &quot;{deleteLessonTitle}&quot;?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>This will delete the lesson and all its sections.</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" slot="close">Cancel</Button>
            <Button variant="danger" onPress={() => deleteLessonId && handleDelete(deleteLessonId)}>Delete</Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
      </AlertDialog>

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
          onPress={handleCreate}
          isDisabled={!newTitle.trim() || pending}
        >
          <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
          Add lesson
        </Button>
        <CreateExerciseGroupDialog courseId={courseId} unitId={unitId} />
      </div>
    </div>
  )
}
