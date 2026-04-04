"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
import {
  Add01Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  BookOpen02Icon,
  GridTableIcon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"
import { createUnit, updateUnit, deleteUnit, reorderUnits } from "../actions/units"
import { createLesson, deleteLesson } from "../actions/lessons"
import { CreateExerciseGroupDialog } from "@/features/exercise/components/exercise-group-panel"
import { Badge } from "@workspace/ui/components/badge"
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
  const [newUnitTitle, setNewUnitTitle] = useState("")
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id ?? "")
  const [newLessonTitle, setNewLessonTitle] = useState("")

  const activeUnit = units.find((u) => u.id === selectedUnit)

  function handleCreateUnit() {
    if (!newUnitTitle.trim()) return
    startTransition(async () => {
      await createUnit(courseId, newUnitTitle.trim())
      setNewUnitTitle("")
      toast.success("Unit created")
      router.refresh()
    })
  }

  function handleDeleteUnit(unitId: string) {
    startTransition(async () => {
      await deleteUnit(unitId)
      toast.success("Unit deleted")
      router.refresh()
    })
  }

  function handleMoveUnit(index: number, direction: -1 | 1) {
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

  function handleCreateLesson() {
    if (!newLessonTitle.trim() || !selectedUnit) return
    startTransition(async () => {
      await createLesson(courseId, selectedUnit, newLessonTitle.trim())
      setNewLessonTitle("")
      toast.success("Lesson created")
      router.refresh()
    })
  }

  function handleDeleteLesson(lessonId: string) {
    startTransition(async () => {
      await deleteLesson(lessonId)
      toast.success("Lesson deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Units overview header */}
      <div className="rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Units overview</h3>
            <p className="text-muted-foreground text-sm">
              Jump into a unit to map out lessons and content.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={ArrowUpDownIcon} size={14} className="mr-1.5" />
              Reorder units
            </Button>
            <Button size="sm" onClick={() => document.getElementById("new-unit-input")?.focus()}>
              <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1.5" />
              Add unit
            </Button>
          </div>
        </div>

        {/* Add unit input */}
        <div className="mt-4 flex gap-2">
          <Input
            id="new-unit-input"
            placeholder="New unit title..."
            value={newUnitTitle}
            onChange={(e) => setNewUnitTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateUnit()}
          />
          <Button
            variant="outline"
            onClick={handleCreateUnit}
            disabled={!newUnitTitle.trim() || pending}
          >
            Create
          </Button>
        </div>
      </div>

      {/* Reorder units */}
      {units.length > 1 && (
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">Reorder units</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Adjust how units appear to learners. Changes apply immediately after you move a unit.
          </p>
          <div className="space-y-2">
            {units.map((u, i) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl border px-4 py-2">
                <span className="text-sm font-medium">{u.title}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" disabled={i === 0 || pending} onClick={() => handleMoveUnit(i, -1)}>
                    <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" disabled={i === units.length - 1 || pending} onClick={() => handleMoveUnit(i, 1)}>
                    <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" disabled={pending} />}>
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{u.title}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>All lessons in this unit will also be deleted.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUnit(u.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit selection + lesson list */}
      {units.length > 0 && (
        <div className="rounded-2xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Unit selection</h3>
              <p className="text-muted-foreground text-sm">
                Review units and switch between them using the dropdown.
              </p>
            </div>
            <select
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          </div>

          {activeUnit && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold">{activeUnit.title} Unit</h4>
              <p className="text-muted-foreground text-sm">
                {activeUnit.nodes.length} items
              </p>

              {/* Lesson/exercise node list */}
              <div className="mt-4 space-y-2">
                {activeUnit.nodes.map((n, ni) => {
                  if (n.type === "lesson" && n.lesson) {
                    return (
                      <div key={n.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <HugeiconsIcon icon={BookOpen02Icon} size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{n.lesson.title}</p>
                            <p className="text-xs text-muted-foreground">Lesson</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-sm" disabled={pending}>
                            <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                          </Button>
                          <Button variant="ghost" size="icon-sm" disabled={pending}>
                            <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            render={<Link href={`/create/${courseId}/lesson/${n.lesson.id}`} />}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" disabled={pending} />}>
                              <HugeiconsIcon icon={Delete02Icon} size={14} />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete &quot;{n.lesson.title}&quot;?</AlertDialogTitle>
                                <AlertDialogDescription>This will delete the lesson and all its sections.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLesson(n.lesson!.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )
                  }

                  if (n.type === "exercise_group" && n.exerciseGroupId) {
                    return (
                      <div key={n.id} className="flex items-center justify-between rounded-xl border border-dashed px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                            <HugeiconsIcon icon={GridTableIcon} size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Exercise Group</p>
                            <p className="text-xs text-muted-foreground">Exercises</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/create/${courseId}/exercises/${n.exerciseGroupId}`} />}
                        >
                          Edit
                        </Button>
                      </div>
                    )
                  }

                  return null
                })}
              </div>

              {/* Add lesson / exercise buttons */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Lesson title..."
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateLesson()}
                    className="w-48"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCreateLesson}
                    disabled={!newLessonTitle.trim() || pending}
                  >
                    Add New Lesson
                  </Button>
                </div>
                <CreateExerciseGroupDialog courseId={courseId} unitId={selectedUnit} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
