"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
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
        <Button render={<a href={`/learn`} />}>
          Go to learning
        </Button>
      )
    }
    if (existing.status === "pending") {
      return <Badge variant="secondary">Enrollment pending</Badge>
    }
    return <Badge variant="destructive">Enrollment revoked</Badge>
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
    <Button onClick={handleEnroll} disabled={pending}>
      {pending ? "Enrolling..." : "Enroll"}
    </Button>
  )
}
