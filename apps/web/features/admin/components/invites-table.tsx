"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { revokeInvite } from "../actions/invites"
import type { InviteWithStatus } from "../types"

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "default",
  used: "secondary",
  expired: "destructive",
}

export function InvitesTable({ invites }: { invites: InviteWithStatus[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleRevoke(inviteId: string) {
    startTransition(async () => {
      await revokeInvite(inviteId)
      toast.success("Invite revoked")
      router.refresh()
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground text-center">
                No invites yet.
              </TableCell>
            </TableRow>
          ) : (
            invites.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.email}</TableCell>
                <TableCell className="capitalize">{inv.role}</TableCell>
                <TableCell>
                  <code className="text-muted-foreground text-xs">
                    {inv.code.slice(0, 8)}...
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[inv.status]}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(inv.expiresAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {inv.status === "pending" && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="sm" disabled={pending} />}
                      >
                        Revoke
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke invite?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the invite for{" "}
                            {inv.email}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevoke(inv.id)}
                          >
                            Revoke
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
  )
}
