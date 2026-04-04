"use client"

import Link from "next/link"
import { Card, Chip } from "@heroui/react"
import type { EnrolledCourse } from "../types"

export function EnrolledCourses({ courses }: { courses: EnrolledCourse[] }) {
  if (courses.length === 0) {
    return (
      <div className="text-muted-foreground mt-6">
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
          <Card className="hover:bg-muted/50 transition-colors">
            <Card.Header>
              <Card.Title className="text-base">{c.title}</Card.Title>
              <Card.Description>
                {c.sourceLanguage} → {c.targetLanguage}
              </Card.Description>
              <Chip variant="secondary" className="w-fit capitalize">
                {c.difficulty}
              </Chip>
            </Card.Header>
          </Card>
        </Link>
      ))}
    </div>
  )
}
