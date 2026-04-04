"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, Label, Modal, Select, ListBox } from "@heroui/react"
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
        datasetType: fd.get("datasetType") as string,
      })
      toast.success("Exercise group created")
      setOpen(false)
      router.push(`/create/${courseId}/exercises/${group.id}`)
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="outline" size="sm" onPress={() => setOpen(true)}>
        Add exercises
      </Button>
      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop><Modal.Container><Modal.Dialog>
          <Modal.CloseTrigger />
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>Create exercise group</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted-foreground text-sm mb-4">
                Add a group of exercises to this unit.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Vocabulary Set 1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Optional description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datasetType">Dataset type</Label>
                  <Select name="datasetType" defaultSelectedKey="word_pair" aria-label="Dataset type">
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="word_pair" textValue="Word pairs">Word pairs</ListBox.Item>
                        <ListBox.Item id="sentence" textValue="Sentences">Sentences</ListBox.Item>
                        <ListBox.Item id="grammar" textValue="Grammar">Grammar</ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
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
