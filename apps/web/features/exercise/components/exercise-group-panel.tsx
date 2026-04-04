"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, Label, Modal } from "@heroui/react"
import { createExerciseGroup } from "../actions/groups"

export function CreateExerciseGroupDialog({
  courseId,
  unitId,
}: {
  courseId: string
  unitId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const group = await createExerciseGroup(courseId, unitId, {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        datasetType: "mixed",
      })
      toast.success("Exercise group created")
      setOpen(false)
      router.push(`/create/${courseId}/exercises/${group.id}`)
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="secondary" size="sm" onPress={() => setOpen(true)}>
        New Exercise Group
      </Button>
      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop><Modal.Container><Modal.Dialog className="sm:max-w-sm">
          <Modal.CloseTrigger />
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>New exercise group</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="eg-title">Title</Label>
                <Input id="eg-title" name="title" placeholder="e.g. Vocabulary Set 1" required className="w-full" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="eg-desc">Description</Label>
                <Input id="eg-desc" name="description" placeholder="Optional" className="w-full" />
              </div>
              <p className="text-muted text-xs">
                You can add different exercise types (MCQ, cloze, sentence builder, etc.) after creating the group.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">Cancel</Button>
              <Button type="submit" isDisabled={pending}>
                {pending ? "Creating..." : "Create"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog></Modal.Container></Modal.Backdrop>
      </Modal>
    </>
  )
}
