"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp, sendVerificationEmail } from "@/lib/auth-client"
import { Button, Input, Label, Card } from "@heroui/react"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { data, error } = await signUp.email({ name, email, password })

    if (error) {
      setError(error.message ?? "Failed to sign up")
      setLoading(false)
      return
    }

    if (data && !data.token) {
      setEmailSent(true)
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    setResending(true)
    await sendVerificationEmail({ email })
    setResent(true)
    setResending(false)
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
              We sent a verification link to <strong>{email}</strong>. Click the link to activate your account.
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex justify-center">
            <Button
              variant="outline"
              onPress={handleResend}
              isDisabled={resending || resent}
            >
              {resent ? "Email sent!" : resending ? "Sending..." : "Resend email"}
            </Button>
          </Card.Content>
          <Card.Footer className="justify-center">
            <p className="text-muted text-sm">
              Already verified?{" "}
              <Link href="/sign-in" className="text-foreground font-medium underline">
                Sign in
              </Link>
            </p>
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
          <Card.Title className="text-xl">Create your account</Card.Title>
          <Card.Description>Start learning or creating courses.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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
            <Button type="submit" className="w-full" isDisabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Card.Content>
        <Card.Footer className="justify-center">
          <p className="text-muted text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground font-medium underline">
              Sign in
            </Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  )
}
