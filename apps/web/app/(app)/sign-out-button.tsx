"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Button } from "@heroui/react"

export function SignOutButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      onPress={async () => {
        await signOut()
        router.push("/")
        router.refresh()
      }}
    >
      Sign out
    </Button>
  )
}
