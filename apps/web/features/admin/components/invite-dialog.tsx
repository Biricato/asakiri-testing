"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, Modal, Select, ListBox } from "@heroui/react"
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
    <>
      <Button onPress={() => setOpen(true)}>
        Create invite
      </Button>
      <Modal isOpen={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />
              {generatedCode ? (
                <>
                  <Modal.Header>
                    <Modal.Heading>Invite created</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p className="text-muted-foreground text-sm mb-3">
                      Share this invite code with the user.
                    </p>
                    <div className="bg-muted rounded-md p-3">
                      <code className="text-sm break-all">{generatedCode}</code>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline"
                      onPress={() => {
                        navigator.clipboard.writeText(generatedCode)
                        toast.success("Copied to clipboard")
                      }}
                    >
                      Copy code
                    </Button>
                    <Button onPress={handleClose}>Done</Button>
                  </Modal.Footer>
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Modal.Header>
                    <Modal.Heading>Create invite</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p className="text-muted-foreground text-sm mb-4">
                      Invite a user to join the platform.
                    </p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium">Role</label>
                        <Select name="role" defaultSelectedKey="learner" aria-label="Role">
                          <Select.Trigger />
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item id="learner" textValue="Learner">Learner</ListBox.Item>
                              <ListBox.Item id="creator" textValue="Creator">Creator</ListBox.Item>
                              <ListBox.Item id="admin" textValue="Admin">Admin</ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="expires" className="text-sm font-medium">Expires in</label>
                        <Select name="expires" defaultSelectedKey="7" aria-label="Expires in">
                          <Select.Trigger />
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item id="1" textValue="1 day">1 day</ListBox.Item>
                              <ListBox.Item id="7" textValue="7 days">7 days</ListBox.Item>
                              <ListBox.Item id="30" textValue="30 days">30 days</ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button type="submit" isDisabled={pending}>
                      {pending ? "Creating..." : "Create invite"}
                    </Button>
                  </Modal.Footer>
                </form>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  )
}
