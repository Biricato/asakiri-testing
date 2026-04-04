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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
import { setUserRole, banUser, unbanUser } from "../actions/users"
import type { PaginatedResult } from "../types"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  banned: boolean | null
  createdAt: Date
}

export function UsersTable({
  result,
}: {
  result: PaginatedResult<UserRow>
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
    router.push(`/admin/users?${params.toString()}`)
  }

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      await setUserRole(userId, role as "admin" | "creator" | "learner")
      toast.success("Role updated")
      router.refresh()
    })
  }

  function handleBan(userId: string) {
    startTransition(async () => {
      await banUser(userId)
      toast.success("User banned")
      router.refresh()
    })
  }

  function handleUnban(userId: string) {
    startTransition(async () => {
      await unbanUser(userId)
      toast.success("User unbanned")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or email..."
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              result.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={u.role}
                      onValueChange={(v) => v && handleRoleChange(u.id, v)}
                      disabled={pending}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="learner">Learner</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {u.banned ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnban(u.id)}
                        disabled={pending}
                      >
                        Unban
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" disabled={pending} />}>
                          Ban
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ban {u.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will prevent the user from signing in. You can
                              unban them later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBan(u.id)}>
                              Ban user
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
            {result.total} user{result.total !== 1 ? "s" : ""} total
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
