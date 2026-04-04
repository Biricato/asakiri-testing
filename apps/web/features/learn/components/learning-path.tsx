"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpen02Icon,
  GridTableIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/cn"
import type { LearningUnit } from "../types"

export function LearningPath({
  courseId,
  units,
}: {
  courseId: string
  units: LearningUnit[]
}) {
  return (
    <div className="flex flex-col gap-8">
      {units.map((u, ui) => (
        <div key={u.id} className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">{u.title}</h3>

          <div className="grid gap-2 sm:grid-cols-2">
            {u.nodes.map((n) => {
              const href =
                n.type === "lesson"
                  ? `/learn/${courseId}/lesson/${n.lessonId}`
                  : `/learn/${courseId}/exercise/${n.exerciseGroupId}`

              const isExercise = n.type === "exercise_group"

              return (
                <Link
                  key={n.id}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 transition-opacity hover:opacity-80",
                    n.completed
                      ? "bg-surface-secondary"
                      : isExercise
                        ? "bg-warning/10"
                        : "bg-accent/10",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      n.completed
                        ? "bg-surface-tertiary text-muted"
                        : isExercise
                          ? "bg-warning/20 text-warning"
                          : "bg-accent/20 text-accent",
                    )}
                  >
                    {n.completed ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                    ) : isExercise ? (
                      <HugeiconsIcon icon={GridTableIcon} size={18} />
                    ) : (
                      <HugeiconsIcon icon={BookOpen02Icon} size={18} />
                    )}
                  </div>
                  <span className="text-sm font-medium">{n.title}</span>
                </Link>
              )
            })}
          </div>

          {ui < units.length - 1 && (
            <div className="my-2 h-px bg-border" />
          )}
        </div>
      ))}
    </div>
  )
}
