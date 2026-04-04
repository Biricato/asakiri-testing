"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Add exercises
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create exercise group</DialogTitle>
            <DialogDescription>
              Add a group of exercises to this unit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Select name="datasetType" defaultValue="word_pair">
                <SelectTrigger id="datasetType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="word_pair">Word pairs</SelectItem>
                  <SelectItem value="sentence">Sentences</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
