"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@heroui/react"
import { Button, Input, Label, AlertDialog, Modal, Select, ListBox } from "@heroui/react"
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
  const [addUnitOpen, setAddUnitOpen] = useState(false)
  const [addLessonOpen, setAddLessonOpen] = useState(false)
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null)
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)
  const [deleteUnitTitle, setDeleteUnitTitle] = useState("")
  const [deleteLessonTitle, setDeleteLessonTitle] = useState("")

  const activeUnit = units.find((u) => u.id === selectedUnit)

  function handleCreateUnit() {
    if (!newUnitTitle.trim()) return
    startTransition(async () => {
      await createUnit(courseId, newUnitTitle.trim())
      setNewUnitTitle("")
      setAddUnitOpen(false)
      toast.success("Unit created")
      router.refresh()
    })
  }

  function handleDeleteUnit(unitId: string) {
    startTransition(async () => {
      await deleteUnit(unitId)
      setDeleteUnitId(null)
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
      setAddLessonOpen(false)
      toast.success("Lesson created")
      router.refresh()
    })
  }

  function handleDeleteLesson(lessonId: string) {
    startTransition(async () => {
      await deleteLesson(lessonId)
      setDeleteLessonId(null)
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
          <Button size="sm" onPress={() => setAddUnitOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} size={14} />
            Add unit
          </Button>
        </div>

        {/* Add unit modal */}
        <Modal isOpen={addUnitOpen} onOpenChange={setAddUnitOpen}>
          <Modal.Backdrop><Modal.Container><Modal.Dialog className="sm:max-w-sm">
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>Add unit</Modal.Heading></Modal.Header>
            <Modal.Body>
              <div className="grid gap-1.5">
                <Label htmlFor="new-unit-title">Unit title</Label>
                <Input id="new-unit-title" placeholder="e.g. Getting Started" value={newUnitTitle} onChange={(e) => setNewUnitTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateUnit()} className="w-full" />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">Cancel</Button>
              <Button onPress={handleCreateUnit} isDisabled={!newUnitTitle.trim() || pending}>Create</Button>
            </Modal.Footer>
          </Modal.Dialog></Modal.Container></Modal.Backdrop>
        </Modal>
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
                  <Button variant="ghost" isIconOnly size="sm" isDisabled={i === 0 || pending} onPress={() => handleMoveUnit(i, -1)}>
                    <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                  </Button>
                  <Button variant="ghost" isIconOnly size="sm" isDisabled={i === units.length - 1 || pending} onPress={() => handleMoveUnit(i, 1)}>
                    <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                  </Button>
                  <Button variant="ghost" isIconOnly size="sm" isDisabled={pending} onPress={() => { setDeleteUnitId(u.id); setDeleteUnitTitle(u.title) }}>
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <AlertDialog isOpen={!!deleteUnitId} onOpenChange={(open) => { if (!open) setDeleteUnitId(null) }}>
            <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading>Delete &quot;{deleteUnitTitle}&quot;?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body><p>All lessons in this unit will also be deleted.</p></AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="tertiary" slot="close">Cancel</Button>
                <Button variant="danger" onPress={() => deleteUnitId && handleDeleteUnit(deleteUnitId)}>Delete</Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
          </AlertDialog>
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
            <Select selectedKey={selectedUnit} onSelectionChange={(key) => key && setSelectedUnit(key as string)} aria-label="Unit" className="w-40">
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {units.map((u) => (
                    <ListBox.Item key={u.id} id={u.id} textValue={u.title}>{u.title}</ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
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
                          <Button variant="ghost" isIconOnly size="sm" isDisabled={pending}>
                            <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                          </Button>
                          <Button variant="ghost" isIconOnly size="sm" isDisabled={pending}>
                            <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                          </Button>
                          <Link href={`/create/${courseId}/lesson/${n.lesson.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button variant="ghost" isIconOnly size="sm" isDisabled={pending} onPress={() => { setDeleteLessonId(n.lesson!.id); setDeleteLessonTitle(n.lesson!.title) }}>
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                          </Button>
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
                        <Link href={`/create/${courseId}/exercises/${n.exerciseGroupId}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    )
                  }

                  return null
                })}
              </div>

              {/* Delete lesson alert dialog */}
              <AlertDialog isOpen={!!deleteLessonId} onOpenChange={(open) => { if (!open) setDeleteLessonId(null) }}>
                <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
                  <AlertDialog.CloseTrigger />
                  <AlertDialog.Header>
                    <AlertDialog.Heading>Delete &quot;{deleteLessonTitle}&quot;?</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body><p>This will delete the lesson and all its sections.</p></AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button variant="tertiary" slot="close">Cancel</Button>
                    <Button variant="danger" onPress={() => deleteLessonId && handleDeleteLesson(deleteLessonId)}>Delete</Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
              </AlertDialog>

              {/* Add lesson / exercise buttons */}
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onPress={() => setAddLessonOpen(true)}>
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  Add lesson
                </Button>
                <CreateExerciseGroupDialog courseId={courseId} unitId={selectedUnit} />
              </div>

              {/* Add lesson modal */}
              <Modal isOpen={addLessonOpen} onOpenChange={setAddLessonOpen}>
                <Modal.Backdrop><Modal.Container><Modal.Dialog className="sm:max-w-sm">
                  <Modal.CloseTrigger />
                  <Modal.Header><Modal.Heading>Add lesson</Modal.Heading></Modal.Header>
                  <Modal.Body>
                    <div className="grid gap-1.5">
                      <Label htmlFor="new-lesson-title">Lesson title</Label>
                      <Input id="new-lesson-title" placeholder="e.g. Chapter 1" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateLesson()} className="w-full" />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="tertiary" slot="close">Cancel</Button>
                    <Button onPress={handleCreateLesson} isDisabled={!newLessonTitle.trim() || pending}>Create</Button>
                  </Modal.Footer>
                </Modal.Dialog></Modal.Container></Modal.Backdrop>
              </Modal>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
