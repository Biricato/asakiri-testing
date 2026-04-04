"use client"

import Link from "next/link"
import { Card, Chip } from "@heroui/react"
import type { EnrolledCourse } from "../types"

export function EnrolledCourses({ courses }: { courses: EnrolledCourse[] }) {
  if (courses.length === 0) {
    return (
      <div className="text-muted mt-6">
        <p>No enrolled courses yet.</p>
        <p className="mt-1 text-sm">
          <Link href="/courses" className="text-foreground underline">
            Browse the catalog
          </Link>{" "}
          to find a course.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <Link key={c.enrollmentId} href={`/learn/${c.courseId}`}>
          <Card className="gap-2">
            {c.coverImageUrl ? (
              <img
                src={c.coverImageUrl}
                alt={c.title}
                className="pointer-events-none aspect-[4/3] w-full rounded-2xl object-cover select-none"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-surface-secondary">
                <span className="text-3xl font-bold text-muted/30">
                  {c.targetLanguage.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <Card.Header>
              <Card.Title>{c.title}</Card.Title>
              <Card.Description>
                {c.sourceLanguage} → {c.targetLanguage}
              </Card.Description>
            </Card.Header>
            <Card.Footer>
              <Chip variant="secondary" className="capitalize">
                {c.difficulty}
              </Chip>
            </Card.Footer>
          </Card>
        </Link>
      ))}
    </div>
  )
}
