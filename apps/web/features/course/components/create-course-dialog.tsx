"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, Label, Modal, Select, ListBox } from "@heroui/react"
import { createCourse } from "../actions/courses"

export function CreateCourseDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const course = await createCourse({
        title: fd.get("title") as string,
        targetLanguage: fd.get("targetLanguage") as string,
        sourceLanguage: fd.get("sourceLanguage") as string,
        difficulty: fd.get("difficulty") as string,
      })
      toast.success("Course created")
      setOpen(false)
      router.push(`/create/${course.id}`)
      router.refresh()
    })
  }

  return (
    <>
      <Button onPress={() => setOpen(true)}>
        New course
      </Button>
      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop><Modal.Container><Modal.Dialog>
          <Modal.CloseTrigger />
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>Create course</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted-foreground text-sm mb-4">
                Set up a new language course.
              </p>
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Learn Okinawan" required className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetLanguage">Target language</Label>
                    <Input id="targetLanguage" name="targetLanguage" placeholder="e.g. Okinawan" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceLanguage">Source language</Label>
                    <Input id="sourceLanguage" name="sourceLanguage" placeholder="e.g. English" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select name="difficulty" defaultSelectedKey="beginner" aria-label="Difficulty">
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="beginner" textValue="Beginner">Beginner</ListBox.Item>
                        <ListBox.Item id="intermediate" textValue="Intermediate">Intermediate</ListBox.Item>
                        <ListBox.Item id="advanced" textValue="Advanced">Advanced</ListBox.Item>
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
