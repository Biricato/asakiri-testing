"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookOpen02Icon, GridTableIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
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
    <div className="flex flex-col items-center gap-4">
      {units.map((u, ui) => (
        <div key={u.id} className="flex w-full flex-col items-center gap-4">
          {/* Unit header pill */}
          <div className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
            {u.title}
          </div>

          {/* Nodes */}
          {u.nodes.map((n, ni) => {
            const href =
              n.type === "lesson"
                ? `/learn/${courseId}/lesson/${n.lessonId}`
                : `/learn/${courseId}/exercise/${n.exerciseGroupId}`

            const isExercise = n.type === "exercise_group"
            // Alternate offset for visual path feel
            const offset = ni % 3 === 0 ? "" : ni % 3 === 1 ? "translate-x-8" : "-translate-x-8"

            return (
              <Link
                key={n.id}
                href={href}
                className={cn(
                  "group flex items-center gap-3 transition-transform hover:scale-105",
                  offset,
                )}
              >
                {/* Node circle */}
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full transition-colors",
                    n.completed
                      ? "bg-primary text-primary-foreground"
                      : isExercise
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground",
                  )}
                >
                  {n.completed ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
                  ) : isExercise ? (
                    <HugeiconsIcon icon={GridTableIcon} size={22} />
                  ) : (
                    <HugeiconsIcon icon={BookOpen02Icon} size={22} />
                  )}
                </div>

                {/* Node label */}
                <span className={cn(
                  "rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                  isExercise
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground",
                )}>
                  {n.title}
                </span>
              </Link>
            )
          })}

          {/* Connector to next unit */}
          {ui < units.length - 1 && (
            <div className="h-6 w-px bg-border" />
          )}
        </div>
      ))}
    </div>
  )
}
