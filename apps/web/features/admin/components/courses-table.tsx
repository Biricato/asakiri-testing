"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
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
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              result.data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.sourceLanguage} → {c.targetLanguage}
                  </TableCell>
                  <TableCell className="capitalize">{c.difficulty}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.creatorName ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    {c.isPublished ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" disabled={pending} />}
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleTogglePublish(c.id, c.isPublished)
                          }
                        >
                          {c.isPublished ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
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
              disabled={currentPage <= 1}
              onClick={() => updateParams("page", String(currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateParams("page", String(currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
