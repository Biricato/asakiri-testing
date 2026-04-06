"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@heroui/react"

export function PatreonDisconnectButton({ role }: { role: "creator" | "learner" }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleDisconnect() {
    setPending(true)
    await fetch("/api/patreon/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    router.refresh()
    setPending(false)
  }

  return (
    <Button variant="danger" size="sm" isDisabled={pending} onPress={handleDisconnect}>
      {pending ? "Disconnecting..." : "Disconnect"}
    </Button>
  )
}
