"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"

export function SignOutButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await signOut()
        router.push("/")
        router.refresh()
      }}
    >
      Sign out
    </Button>
  )
}
