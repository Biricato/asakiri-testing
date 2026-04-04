"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@heroui/react"
import { Table, Badge, Button, Input, Dropdown } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { togglePublish, deleteCourse } from "../actions/courses"
import type { PaginatedResult } from "../types"

type CourseRow = {
  id: string
  title: string
  targetLanguage: string
  sourceLanguage: string
  difficulty: string
  isPublished: boolean
  creatorName: string | null
  createdAt: Date
}

export function CoursesTable({
  result,
}: {
  result: PaginatedResult<CourseRow>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") ?? ""
  const currentPage = Number(searchParams.get("page") ?? "1")
  const totalPages = Math.ceil(result.total / result.pageSize)

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key === "search") params.delete("page")
    router.push(`/admin/courses?${params.toString()}`)
  }

  function handleTogglePublish(courseId: string, isPublished: boolean) {
    startTransition(async () => {
      await togglePublish(courseId, !isPublished)
      toast.success(isPublished ? "Course unpublished" : "Course published")
      router.refresh()
    })
  }

  function handleDelete(courseId: string) {
    startTransition(async () => {
      await deleteCourse(courseId)
      toast.success("Course deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by title or language..."
        defaultValue={currentSearch}
        onChange={(e) => {
          const value = e.target.value
          if (value.length === 0 || value.length >= 2) {
            updateParams("search", value)
          }
        }}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <Table.ScrollContainer>
          <Table.Content aria-label="Courses">
          <Table.Header>
            <Table.Column>Title</Table.Column>
            <Table.Column>Languages</Table.Column>
            <Table.Column>Difficulty</Table.Column>
            <Table.Column>Creator</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Created</Table.Column>
            <Table.Column>{""}</Table.Column>
          </Table.Header>
          <Table.Body>
            {result.data.length === 0 ? (
              <Table.Row>
                <Table.Cell>No courses found.</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
              </Table.Row>
            ) : (
              result.data.map((c) => (
                <Table.Row key={c.id}>
                  <Table.Cell>{c.title}</Table.Cell>
                  <Table.Cell>
                    {c.sourceLanguage} → {c.targetLanguage}
                  </Table.Cell>
                  <Table.Cell className="capitalize">{c.difficulty}</Table.Cell>
                  <Table.Cell>
                    {c.creatorName ?? "Unknown"}
                  </Table.Cell>
                  <Table.Cell>
                    {c.isPublished ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown>
                      <Button variant="ghost" size="sm" isDisabled={pending}>
                        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                      </Button>
                      <Dropdown.Popover>
                        <Dropdown.Menu onAction={(key) => {
                          if (key === "toggle") handleTogglePublish(c.id, c.isPublished)
                          if (key === "delete") handleDelete(c.id)
                        }}>
                          <Dropdown.Item id="toggle">
                            {c.isPublished ? "Unpublish" : "Publish"}
                          </Dropdown.Item>
                          <Dropdown.Item id="delete">
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
          </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {result.total} course{result.total !== 1 ? "s" : ""} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              isDisabled={currentPage <= 1}
              onPress={() => updateParams("page", String(currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              isDisabled={currentPage >= totalPages}
              onPress={() => updateParams("page", String(currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
