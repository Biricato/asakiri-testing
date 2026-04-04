"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, Label, Select, Card, ListBox, AlertDialog } from "@heroui/react"
import { updateCourse, deleteCourse } from "../actions/courses"
import type { Course } from "../types"

export function CourseSettings({ course }: { course: Course }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      await updateCourse(course.id, {
        title: fd.get("title") as string,
        subtitle: (fd.get("subtitle") as string) || undefined,
        targetLanguage: fd.get("targetLanguage") as string,
        sourceLanguage: fd.get("sourceLanguage") as string,
        difficulty: fd.get("difficulty") as string,
      })
      toast.success("Course updated")
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCourse(course.id)
      toast.success("Course deleted")
      router.push("/create")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <Card.Header>
            <Card.Title>Course Settings</Card.Title>
            <Card.Description>Update course metadata.</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={course.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" name="subtitle" defaultValue={course.subtitle ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetLanguage">Target language</Label>
                <Input id="targetLanguage" name="targetLanguage" defaultValue={course.targetLanguage} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceLanguage">Source language</Label>
                <Input id="sourceLanguage" name="sourceLanguage" defaultValue={course.sourceLanguage} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty" defaultSelectedKey={course.difficulty} aria-label="Difficulty">
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
            <Button type="submit" isDisabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </Card.Content>
        </Card>
      </form>

      <Card className="border-destructive">
        <Card.Header>
          <Card.Title>Danger Zone</Card.Title>
          <Card.Description>
            Permanently delete this course and all its content.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <Button variant="danger" isDisabled={pending} onPress={() => setDeleteOpen(true)}>
            Delete course
          </Button>
          <AlertDialog isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading>Delete &quot;{course.title}&quot;?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will permanently delete the course, all units, lessons,
                  sections, and exercises. This cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="tertiary" slot="close">Cancel</Button>
                <Button variant="danger" onPress={handleDelete}>Delete</Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
          </AlertDialog>
        </Card.Content>
      </Card>
    </div>
  )
}
