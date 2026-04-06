"use client"

import Link from "next/link"
import { Card, Chip } from "@heroui/react"
import { CoursePlaceholder } from "@/components/course-placeholder"
import type { Course } from "../types"

export function CourseList({ courses }: { courses: (Course & { role?: string })[] }) {
  if (courses.length === 0) {
    return (
      <p className="text-muted mt-6">
        No courses yet. Create your first course to get started.
      </p>
    )
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <Link key={c.id} href={`/create/${c.id}`}>
          <Card className="gap-2">
            {c.coverImageUrl ? (
              <img
                src={c.coverImageUrl}
                alt={c.title}
                className="pointer-events-none aspect-[4/3] w-full rounded-2xl object-cover select-none"
                loading="lazy"
              />
            ) : (
              <CoursePlaceholder title={c.title} />
            )}
            <Card.Header>
              <Card.Title>{c.title}</Card.Title>
              <Card.Description>
                {c.sourceLanguage} → {c.targetLanguage}
              </Card.Description>
            </Card.Header>
            <Card.Footer className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Chip variant="secondary" className="capitalize">
                  {c.difficulty}
                </Chip>
                {c.role && c.role !== "owner" && (
                  <Chip variant="soft" className="capitalize text-xs">
                    {c.role}
                  </Chip>
                )}
              </div>
              {c.isPublished ? (
                <Chip color="success">Published</Chip>
              ) : (
                <Chip variant="secondary">Draft</Chip>
              )}
            </Card.Footer>
          </Card>
        </Link>
      ))}
    </div>
  )
}
