"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@heroui/react"
import { Button, Input, Label, AlertDialog, Modal } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  BookOpen02Icon,
  GridTableIcon,
} from "@hugeicons/core-free-icons"
import { createUnit, deleteUnit, reorderUnits } from "../actions/units"
import { createLesson, deleteLesson } from "../actions/lessons"
import { reorderNodes, deleteNode } from "../actions/nodes"
import { CreateExerciseGroupDialog } from "@/features/exercise/components/exercise-group-panel"
import { LessonTierSelect } from "./lesson-tier-select"
import type { UnitWithLessons } from "../types"
import type { PatreonTier } from "@/schema/patreon"

export function UnitList({
  courseId,
  units,
  patreonTiers = [],
  lessonTiers = {},
}: {
  courseId: string
  units: UnitWithLessons[]
  patreonTiers?: PatreonTier[]
  lessonTiers?: Record<string, { tierId: string; tierTitle: string; tierAmountCents: number }>
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [newUnitTitle, setNewUnitTitle] = useState("")
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [addUnitOpen, setAddUnitOpen] = useState(false)
  const [addLessonUnitId, setAddLessonUnitId] = useState<string | null>(null)
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null)
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null)
  const [deleteUnitTitle, setDeleteUnitTitle] = useState("")
  const [deleteLessonTitle, setDeleteLessonTitle] = useState("")
  const [deleteNodeTitle, setDeleteNodeTitle] = useState("")

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

  function handleCreateLesson(unitId: string) {
    if (!newLessonTitle.trim()) return
    startTransition(async () => {
      await createLesson(courseId, unitId, newLessonTitle.trim())
      setNewLessonTitle("")
      setAddLessonUnitId(null)
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

  function handleMoveNode(unitObj: typeof units[0], nodeIndex: number, direction: -1 | 1) {
    const newIndex = nodeIndex + direction
    if (newIndex < 0 || newIndex >= unitObj.nodes.length) return
    const ids = unitObj.nodes.map((n) => n.id)
    const [moved] = ids.splice(nodeIndex, 1)
    ids.splice(newIndex, 0, moved!)
    startTransition(async () => {
      await reorderNodes(unitObj.id, ids)
      router.refresh()
    })
  }

  function handleDeleteNode(nodeId: string) {
    startTransition(async () => {
      await deleteNode(nodeId)
      setDeleteNodeId(null)
      toast.success("Deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Units stacked */}
      {units.map((u, i) => (
        <div key={u.id} className="rounded-2xl border p-5">
          {/* Unit header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{u.title}</h3>
            <div className="flex items-center gap-1">
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

          {/* Nodes */}
          <div className="mt-3 space-y-2">
            {u.nodes.map((n, ni) => {
              const isLesson = n.type === "lesson" && n.lesson
              const isExercise = n.type === "exercise_group" && n.exerciseGroupId
              const title = isLesson
                ? n.lesson!.title
                : n.exerciseGroupTitle ?? "Exercises"
              const href = isLesson
                ? `/create/${courseId}/lesson/${n.lesson!.id}`
                : `/create/${courseId}/exercises/${n.exerciseGroupId}`

              return (
                <div
                  key={n.id}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${isExercise ? "bg-warning/5" : "bg-accent/5"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${isExercise ? "bg-warning/15 text-warning" : "bg-accent/15 text-accent"}`}>
                      <HugeiconsIcon icon={isExercise ? GridTableIcon : BookOpen02Icon} size={16} />
                    </div>
                    <span className="text-sm font-medium">{title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" isIconOnly size="sm" isDisabled={ni === 0 || pending} onPress={() => handleMoveNode(u, ni, -1)}>
                      <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                    </Button>
                    <Button variant="ghost" isIconOnly size="sm" isDisabled={ni === u.nodes.length - 1 || pending} onPress={() => handleMoveNode(u, ni, 1)}>
                      <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                    </Button>
                    {isLesson && patreonTiers.length > 0 && (
                      <LessonTierSelect
                        lessonId={n.lesson!.id}
                        tiers={patreonTiers}
                        currentTierId={lessonTiers[n.lesson!.id]?.tierId ?? null}
                      />
                    )}
                    <Link href={href}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Button variant="ghost" isIconOnly size="sm" isDisabled={pending} onPress={() => {
                      if (isLesson) { setDeleteLessonId(n.lesson!.id); setDeleteLessonTitle(n.lesson!.title) }
                      else { setDeleteNodeId(n.id); setDeleteNodeTitle(title) }
                    }}>
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add lesson / exercise */}
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onPress={() => { setAddLessonUnitId(u.id); setNewLessonTitle("") }}>
              New Lesson
            </Button>
            <CreateExerciseGroupDialog courseId={courseId} unitId={u.id} />
          </div>
        </div>
      ))}

      {/* Add unit button */}
      <Button variant="outline" onPress={() => setAddUnitOpen(true)} className="w-full">
        <HugeiconsIcon icon={Add01Icon} size={14} />
        Add unit
      </Button>

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

      {/* Add lesson modal */}
      <Modal isOpen={!!addLessonUnitId} onOpenChange={(open) => { if (!open) setAddLessonUnitId(null) }}>
        <Modal.Backdrop><Modal.Container><Modal.Dialog className="sm:max-w-sm">
          <Modal.CloseTrigger />
          <Modal.Header><Modal.Heading>Add lesson</Modal.Heading></Modal.Header>
          <Modal.Body>
            <div className="grid gap-1.5">
              <Label htmlFor="new-lesson-title">Lesson title</Label>
              <Input id="new-lesson-title" placeholder="e.g. Chapter 1" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLessonUnitId && handleCreateLesson(addLessonUnitId)} className="w-full" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" slot="close">Cancel</Button>
            <Button onPress={() => addLessonUnitId && handleCreateLesson(addLessonUnitId)} isDisabled={!newLessonTitle.trim() || pending}>Create</Button>
          </Modal.Footer>
        </Modal.Dialog></Modal.Container></Modal.Backdrop>
      </Modal>

      {/* Delete unit dialog */}
      <AlertDialog isOpen={!!deleteUnitId} onOpenChange={(open) => { if (!open) setDeleteUnitId(null) }}>
        <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header><AlertDialog.Heading>Delete &quot;{deleteUnitTitle}&quot;?</AlertDialog.Heading></AlertDialog.Header>
          <AlertDialog.Body><p>All lessons in this unit will also be deleted.</p></AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" slot="close">Cancel</Button>
            <Button variant="danger" onPress={() => deleteUnitId && handleDeleteUnit(deleteUnitId)}>Delete</Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
      </AlertDialog>

      {/* Delete lesson dialog */}
      <AlertDialog isOpen={!!deleteLessonId} onOpenChange={(open) => { if (!open) setDeleteLessonId(null) }}>
        <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header><AlertDialog.Heading>Delete &quot;{deleteLessonTitle}&quot;?</AlertDialog.Heading></AlertDialog.Header>
          <AlertDialog.Body><p>This will delete the lesson and all its sections.</p></AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" slot="close">Cancel</Button>
            <Button variant="danger" onPress={() => deleteLessonId && handleDeleteLesson(deleteLessonId)}>Delete</Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
      </AlertDialog>

      {/* Delete exercise group dialog */}
      <AlertDialog isOpen={!!deleteNodeId} onOpenChange={(open) => { if (!open) setDeleteNodeId(null) }}>
        <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header><AlertDialog.Heading>Delete &quot;{deleteNodeTitle}&quot;?</AlertDialog.Heading></AlertDialog.Header>
          <AlertDialog.Body><p>This will delete the exercise group and all its exercises.</p></AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" slot="close">Cancel</Button>
            <Button variant="danger" onPress={() => deleteNodeId && handleDeleteNode(deleteNodeId)}>Delete</Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  )
}
