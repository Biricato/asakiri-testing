"use client"

import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, BookOpen02Icon, GridTableIcon } from "@hugeicons/core-free-icons"
import type { LearningUnit } from "../types"

export function LearningPath({
  courseId,
  units,
}: {
  courseId: string
  units: LearningUnit[]
}) {
  return (
    <div className="space-y-6">
      {units.map((u) => {
        const completed = u.nodes.filter((n) => n.completed).length
        const total = u.nodes.length

        return (
          <div key={u.id}>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold">{u.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {completed}/{total}
              </Badge>
            </div>

            <div className="space-y-1">
              {u.nodes.map((n) => {
                const href =
                  n.type === "lesson"
                    ? `/learn/${courseId}/lesson/${n.lessonId}`
                    : `/learn/${courseId}/exercise/${n.exerciseGroupId}`

                return (
                  <Link
                    key={n.id}
                    href={href}
                    className="hover:bg-muted/50 flex items-center gap-3 rounded-md border px-3 py-2 transition-colors"
                  >
                    {n.completed ? (
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={18}
                        className="text-green-500"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={n.type === "lesson" ? BookOpen02Icon : GridTableIcon}
                        size={18}
                        className="text-muted-foreground"
                      />
                    )}
                    <span className="text-sm">{n.title}</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-xs capitalize"
                    >
                      {n.type === "lesson" ? "Lesson" : "Exercises"}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
