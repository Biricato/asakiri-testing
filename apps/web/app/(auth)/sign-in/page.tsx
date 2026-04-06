"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, sendVerificationEmail } from "@/lib/auth-client"
import { Button, Input, Label, Card } from "@heroui/react"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setEmailNotVerified(false)
    setLoading(true)

    const { error } = await signIn.email({ email, password })

    if (error) {
      const msg = error.message ?? "Failed to sign in"
      if (msg.toLowerCase().includes("email is not verified") || error.code === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true)
      }
      setError(msg)
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  async function handleResendVerification() {
    setResending(true)
    await sendVerificationEmail({ email })
    setResent(true)
    setResending(false)
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <Card.Header className="text-center">
          <Link href="/" className="mx-auto mb-2 flex items-center gap-2">
            <img src="/logo.svg" alt="Asakiri" className="size-8" />
          </Link>
          <Card.Title className="text-xl">Welcome back</Card.Title>
          <Card.Description>Sign in to continue learning.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                <p>{error}</p>
                {emailNotVerified && (
                  <button
                    type="button"
                    className="mt-1 font-medium underline disabled:opacity-50"
                    onClick={handleResendVerification}
                    disabled={resending || resent}
                  >
                    {resent ? "Verification email sent!" : resending ? "Sending..." : "Resend verification email"}
                  </button>
                )}
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
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-muted text-sm underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full" isDisabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card.Content>
        <Card.Footer className="justify-center">
          <p className="text-muted text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-foreground font-medium underline">
              Sign up
            </Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  )
}
