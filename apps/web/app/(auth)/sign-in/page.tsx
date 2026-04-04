"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"
import { Button, Input, Label, Card } from "@heroui/react"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await signIn.email({ email, password })

    if (error) {
      setError(error.message ?? "Failed to sign in")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
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
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
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
