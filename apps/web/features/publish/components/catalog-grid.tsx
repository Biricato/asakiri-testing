"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, Chip, Input, Select, ListBox } from "@heroui/react"
import type { CatalogCourse } from "../types"

export function CatalogGrid({ courses }: { courses: CatalogCourse[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/courses?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search courses..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const v = e.target.value
            if (v.length === 0 || v.length >= 2) updateParam("search", v)
          }}
          className="max-w-xs"
        />
        <Select
          selectedKey={searchParams.get("difficulty") ?? "all"}
          onSelectionChange={(key) => key && updateParam("difficulty", key as string)}
          aria-label="Difficulty"
          className="w-36"
        >
          <Select.Trigger />
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="all" textValue="All levels">All levels</ListBox.Item>
              <ListBox.Item id="beginner" textValue="Beginner">Beginner</ListBox.Item>
              <ListBox.Item id="intermediate" textValue="Intermediate">Intermediate</ListBox.Item>
              <ListBox.Item id="advanced" textValue="Advanced">Advanced</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground">No courses available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`}>
              <Card className="hover:bg-muted/50 h-full transition-colors">
                {c.coverImageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={c.coverImageUrl}
                      alt={c.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Card.Header>
                  <div className="flex items-start justify-between gap-2">
                    <Card.Title className="text-base">{c.title}</Card.Title>
                    <Chip variant="secondary" className="shrink-0 capitalize">
                      {c.difficulty}
                    </Chip>
                  </div>
                  {c.subtitle && <Card.Description>{c.subtitle}</Card.Description>}
                </Card.Header>
                <Card.Content>
                  <p className="text-muted-foreground text-sm">
                    {c.sourceLanguage} → {c.targetLanguage}
                  </p>
                  {c.creatorName && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      by {c.creatorName}
                    </p>
                  )}
                </Card.Content>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
