"use client"

import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
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
            <CardHeader>
              <CardTitle className="text-base">{c.title}</CardTitle>
              <CardDescription>
                {c.sourceLanguage} → {c.targetLanguage}
              </CardDescription>
              <Badge variant="secondary" className="w-fit capitalize">
                {c.difficulty}
              </Badge>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
