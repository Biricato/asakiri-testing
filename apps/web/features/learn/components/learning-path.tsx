"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpen02Icon,
  GridTableIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { Card } from "@heroui/react"
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
        <div key={u.id} className="flex flex-col gap-3">
          {/* Unit header */}
          <h3 className="text-lg font-semibold">{u.title}</h3>

          {/* Nodes */}
          <div className="grid gap-3 sm:grid-cols-2">
            {u.nodes.map((n) => {
              const href =
                n.type === "lesson"
                  ? `/learn/${courseId}/lesson/${n.lessonId}`
                  : `/learn/${courseId}/exercise/${n.exerciseGroupId}`

              const isExercise = n.type === "exercise_group"

              return (
                <Link key={n.id} href={href}>
                  <Card
                    className={cn(
                      "flex-row items-center gap-3 border-0",
                      n.completed
                        ? "bg-surface-secondary"
                        : isExercise
                          ? "bg-amber-50 dark:bg-amber-950/30"
                          : "bg-emerald-50 dark:bg-emerald-950/30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        n.completed
                          ? "bg-surface-tertiary text-muted"
                          : isExercise
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
                      )}
                    >
                      {n.completed ? (
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
                      ) : isExercise ? (
                        <HugeiconsIcon icon={GridTableIcon} size={20} />
                      ) : (
                        <HugeiconsIcon icon={BookOpen02Icon} size={20} />
                      )}
                    </div>
                    <span className="text-sm font-medium">{n.title}</span>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Separator between units */}
          {ui < units.length - 1 && (
            <div className="my-2 h-px bg-border" />
          )}
        </div>
      ))}
    </div>
  )
}
