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
          <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
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
        <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`}>
              <Card className="gap-2">
                {c.coverImageUrl && (
                  <img
                    src={c.coverImageUrl}
                    alt={c.title}
                    className="pointer-events-none aspect-[4/3] w-full rounded-2xl object-cover select-none"
                    loading="lazy"
                  />
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
                <Card.Footer>
                  <span className="text-muted text-sm">
                    {c.sourceLanguage} → {c.targetLanguage}
                  </span>
                  {c.creatorName && (
                    <span className="text-muted ml-auto text-xs">
                      by {c.creatorName}
                    </span>
                  )}
                </Card.Footer>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
