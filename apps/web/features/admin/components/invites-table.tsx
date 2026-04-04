"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Table, Chip, Button, AlertDialog } from "@heroui/react"
import { revokeInvite } from "../actions/invites"
import type { InviteWithStatus } from "../types"

const statusColor: Record<string, "default" | "success" | "danger"> = {
  pending: "default",
  used: "success",
  expired: "danger",
}

export function InvitesTable({ invites }: { invites: InviteWithStatus[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<InviteWithStatus | null>(null)

  function handleRevoke(inviteId: string) {
    startTransition(async () => {
      await revokeInvite(inviteId)
      toast.success("Invite revoked")
      router.refresh()
    })
  }

  return (
    <div className="rounded-md border">
      <Table aria-label="Invites">
        <Table.Header>
          <Table.Column>Email</Table.Column>
          <Table.Column>Role</Table.Column>
          <Table.Column>Code</Table.Column>
          <Table.Column>Status</Table.Column>
          <Table.Column>Expires</Table.Column>
          <Table.Column>Created</Table.Column>
          <Table.Column>Actions</Table.Column>
        </Table.Header>
        <Table.Body>
          {invites.length === 0 ? (
            <Table.Row>
              <Table.Cell>No invites yet.</Table.Cell>
              <Table.Cell>{""}</Table.Cell>
              <Table.Cell>{""}</Table.Cell>
              <Table.Cell>{""}</Table.Cell>
              <Table.Cell>{""}</Table.Cell>
              <Table.Cell>{""}</Table.Cell>
              <Table.Cell>{""}</Table.Cell>
            </Table.Row>
          ) : (
            invites.map((inv) => (
              <Table.Row key={inv.id}>
                <Table.Cell>{inv.email}</Table.Cell>
                <Table.Cell className="capitalize">{inv.role}</Table.Cell>
                <Table.Cell>
                  <code className="text-muted-foreground text-xs">
                    {inv.code.slice(0, 8)}...
                  </code>
                </Table.Cell>
                <Table.Cell>
                  <Chip color={statusColor[inv.status]}>
                    {inv.status}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  {new Date(inv.expiresAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  {inv.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      isDisabled={pending}
                      onPress={() => {
                        setRevokeTarget(inv)
                        setRevokeDialogOpen(true)
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>

      <AlertDialog isOpen={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading>Revoke invite?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will permanently delete the invite for{" "}
                  {revokeTarget?.email}. This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="tertiary" slot="close">Cancel</Button>
                <Button
                  variant="danger"
                  onPress={() => {
                    if (revokeTarget) handleRevoke(revokeTarget.id)
                    setRevokeDialogOpen(false)
                  }}
                >
                  Revoke
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  )
}
