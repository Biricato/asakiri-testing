"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, Label, Card } from "@heroui/react"
import {
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
  type Collaborator,
} from "../actions/collaborators"

export function CollaboratorSettings({
  courseId,
  collaborators,
  isOwner,
}: {
  courseId: string
  collaborators: Collaborator[]
  isOwner: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"editor" | "viewer">("editor")
  const [error, setError] = useState("")

  function handleAdd() {
    if (!email.trim()) return
    setError("")
    startTransition(async () => {
      const result = await addCollaborator(courseId, email.trim(), role)
      if (result.success) {
        toast.success("Collaborator added")
        setEmail("")
        router.refresh()
      } else {
        setError(result.error ?? "Failed to add collaborator")
      }
    })
  }

  function handleRoleChange(id: string, newRole: "editor" | "viewer") {
    startTransition(async () => {
      await updateCollaboratorRole(id, newRole)
      toast.success("Role updated")
      router.refresh()
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeCollaborator(id)
      toast.success("Collaborator removed")
      router.refresh()
    })
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Collaborators</Card.Title>
        <Card.Description>
          Invite others to edit this course. Editors can modify lessons, exercises, and publish.
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        {collaborators.length > 0 && (
          <div className="space-y-2">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-muted-foreground text-xs">{c.email}</p>
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={c.role}
                      onChange={(e) => handleRoleChange(c.id, e.target.value as "editor" | "viewer")}
                      disabled={pending}
                      className="rounded-lg border border-[var(--field-border)] bg-[var(--field-background)] px-2 py-1 text-xs text-[var(--field-foreground)]"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <Button
                      variant="danger"
                      size="sm"
                      isDisabled={pending}
                      onPress={() => handleRemove(c.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs capitalize">{c.role}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <div className="space-y-2 border-t border-border pt-4">
            {error && (
              <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}
            <Label htmlFor="collab-email">Add collaborator by email</Label>
            <div className="flex gap-2">
              <Input
                id="collab-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="rounded-lg border border-[var(--field-border)] bg-[var(--field-background)] px-2 py-1 text-sm text-[var(--field-foreground)]"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button onPress={handleAdd} isDisabled={!email.trim() || pending} size="sm">
                {pending ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
