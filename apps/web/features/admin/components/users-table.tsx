"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@heroui/react"
import { Table, Chip, Button, Input, Select, ListBox, AlertDialog } from "@heroui/react"
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
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banTarget, setBanTarget] = useState<UserRow | null>(null)

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
        <Table aria-label="Users">
          <Table.Header>
            <Table.Column>Name</Table.Column>
            <Table.Column>Email</Table.Column>
            <Table.Column>Role</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Joined</Table.Column>
            <Table.Column>Actions</Table.Column>
          </Table.Header>
          <Table.Body>
            {result.data.length === 0 ? (
              <Table.Row>
                <Table.Cell>No users found.</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
              </Table.Row>
            ) : (
              result.data.map((u) => (
                <Table.Row key={u.id}>
                  <Table.Cell>{u.name}</Table.Cell>
                  <Table.Cell>{u.email}</Table.Cell>
                  <Table.Cell>
                    <Select
                      selectedKey={u.role}
                      onSelectionChange={(key) => key && handleRoleChange(u.id, key as string)}
                      isDisabled={pending}
                      aria-label="Role"
                    >
                      <Select.Trigger />
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="admin" textValue="Admin">Admin</ListBox.Item>
                          <ListBox.Item id="creator" textValue="Creator">Creator</ListBox.Item>
                          <ListBox.Item id="learner" textValue="Learner">Learner</ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </Table.Cell>
                  <Table.Cell>
                    {u.banned ? (
                      <Chip color="danger">Banned</Chip>
                    ) : (
                      <Chip variant="secondary">Active</Chip>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {u.banned ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleUnban(u.id)}
                        isDisabled={pending}
                      >
                        Unban
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        isDisabled={pending}
                        onPress={() => {
                          setBanTarget(u)
                          setBanDialogOpen(true)
                        }}
                      >
                        Ban
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      <AlertDialog isOpen={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading>Ban {banTarget?.name}?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will prevent the user from signing in. You can
                  unban them later.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="tertiary" slot="close">Cancel</Button>
                <Button
                  variant="danger"
                  onPress={() => {
                    if (banTarget) handleBan(banTarget.id)
                    setBanDialogOpen(false)
                  }}
                >
                  Ban user
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {result.total} user{result.total !== 1 ? "s" : ""} total
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
