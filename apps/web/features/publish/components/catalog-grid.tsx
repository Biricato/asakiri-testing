"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
          defaultValue={searchParams.get("difficulty") ?? "all"}
          onValueChange={(v) => v && updateParam("difficulty", v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
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
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{c.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {c.difficulty}
                    </Badge>
                  </div>
                  {c.subtitle && <CardDescription>{c.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {c.sourceLanguage} → {c.targetLanguage}
                  </p>
                  {c.creatorName && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      by {c.creatorName}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
