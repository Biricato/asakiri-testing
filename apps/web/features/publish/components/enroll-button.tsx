"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Chip } from "@heroui/react"
import { enroll } from "../actions/enroll"
import type { Enrollment } from "../types"

export function EnrollButton({
  publishedCourseId,
  enrollment: existing,
}: {
  publishedCourseId: string
  enrollment: Enrollment | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (existing) {
    if (existing.status === "active") {
      return (
        <a href="/learn">
          <Button>Go to learning</Button>
        </a>
      )
    }
    if (existing.status === "pending") {
      return <Chip variant="secondary">Enrollment pending</Chip>
    }
    return <Chip color="danger">Enrollment revoked</Chip>
  }

  function handleEnroll() {
    startTransition(async () => {
      const result = await enroll(publishedCourseId)
      if (result.status === "active") {
        toast.success("Enrolled successfully!")
      } else {
        toast.success("Enrollment request submitted")
      }
      router.refresh()
    })
  }

  return (
    <Button onPress={handleEnroll} isDisabled={pending}>
      {pending ? "Enrolling..." : "Enroll"}
    </Button>
  )
}
