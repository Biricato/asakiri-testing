"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { resetPassword } from "@/lib/auth-client"
import { Button, Input, Label, Card } from "@heroui/react"

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <Card.Header className="text-center">
            <Card.Title className="text-xl">Invalid link</Card.Title>
            <Card.Description>
              This password reset link is invalid or has expired.
            </Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Link href="/forgot-password" className="text-foreground text-sm font-medium underline">
              Request a new link
            </Link>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    const { error } = await resetPassword({ newPassword: password, token: token! })

    if (error) {
      setError(error.message ?? "Failed to reset password")
      setLoading(false)
      return
    }

    router.push("/sign-in")
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <Card.Header className="text-center">
          <Link href="/" className="mx-auto mb-2 flex items-center gap-2">
            <img src="/logo.svg" alt="Asakiri" className="size-8" />
          </Link>
          <Card.Title className="text-xl">Reset password</Card.Title>
          <Card.Description>Enter your new password.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="w-full"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full" isDisabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}
