"use client"

import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import type { Course } from "../types"

export function CourseList({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground mt-6">
        No courses yet. Create your first course to get started.
      </p>
    )
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <Link key={c.id} href={`/create/${c.id}`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.title}</CardTitle>
                {c.isPublished ? (
                  <Badge>Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <CardDescription>
                {c.sourceLanguage} → {c.targetLanguage} · {c.difficulty}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
