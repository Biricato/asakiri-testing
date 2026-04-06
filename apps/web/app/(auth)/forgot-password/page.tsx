"use client"

import { useState } from "react"
import Link from "next/link"
import { forgetPassword } from "@/lib/auth-client"
import { Button, Input, Label, Card } from "@heroui/react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await forgetPassword({ email, redirectTo: "/reset-password" })

    if (error) {
      setError(error.message ?? "Failed to send reset email")
      setLoading(false)
      return
    }

    setEmailSent(true)
    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <Card.Header className="text-center">
            <Link href="/" className="mx-auto mb-2 flex items-center gap-2">
              <img src="/logo.svg" alt="Asakiri" className="size-8" />
            </Link>
            <Card.Title className="text-xl">Check your email</Card.Title>
            <Card.Description>
              If an account exists for <strong>{email}</strong>, we sent a password reset link.
            </Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Link href="/sign-in" className="text-foreground text-sm font-medium underline">
              Back to sign in
            </Link>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <Card.Header className="text-center">
          <Link href="/" className="mx-auto mb-2 flex items-center gap-2">
            <img src="/logo.svg" alt="Asakiri" className="size-8" />
          </Link>
          <Card.Title className="text-xl">Forgot password</Card.Title>
          <Card.Description>Enter your email to receive a reset link.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full" isDisabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </Card.Content>
        <Card.Footer className="justify-center">
          <Link href="/sign-in" className="text-muted text-sm font-medium underline">
            Back to sign in
          </Link>
        </Card.Footer>
      </Card>
    </div>
  )
}
