"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { createInvite } from "../actions/invites"

export function InviteDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createInvite({
        email: formData.get("email") as string,
        role: formData.get("role") as string,
        expiresInDays: Number(formData.get("expires")),
      })
      setGeneratedCode(result.code)
      toast.success("Invite created")
      router.refresh()
    })
  }

  function handleClose() {
    setOpen(false)
    setGeneratedCode(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger render={<Button />}>
        Create invite
      </DialogTrigger>
      <DialogContent>
        {generatedCode ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite created</DialogTitle>
              <DialogDescription>
                Share this invite code with the user.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted rounded-md p-3">
              <code className="text-sm break-all">{generatedCode}</code>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode)
                  toast.success("Copied to clipboard")
                }}
              >
                Copy code
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create invite</DialogTitle>
              <DialogDescription>
                Invite a user to join the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="learner">
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Expires in</Label>
                <Select name="expires" defaultValue="7">
                  <SelectTrigger id="expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
