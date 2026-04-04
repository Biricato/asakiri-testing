"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button } from "@heroui/react"
import { publishCourse, unpublishCourse } from "../actions/publish"

export function PublishButton({
  courseId,
  isPublished,
}: {
  courseId: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handlePublish() {
    startTransition(async () => {
      const result = await publishCourse(courseId)
      if (result.success) {
        toast.success(`Published! Slug: /courses/${result.slug}`)
        router.refresh()
      }
    })
  }

  function handleUnpublish() {
    startTransition(async () => {
      await unpublishCourse(courseId)
      toast.success("Course unpublished")
      router.refresh()
    })
  }

  return isPublished ? (
    <Button variant="outline" onPress={handleUnpublish} isDisabled={pending}>
      {pending ? "Unpublishing..." : "Unpublish"}
    </Button>
  ) : (
    <Button onPress={handlePublish} isDisabled={pending}>
      {pending ? "Publishing..." : "Publish course"}
    </Button>
  )
}
