"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Button, Input, Label } from "@heroui/react"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await signUp.email({ name, email, password })

    if (error) {
      setError(error.message ?? "Failed to sign up")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh">
      {/* Sidebar — hidden on mobile */}
      <div className="bg-muted relative hidden flex-1 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(142_84%_60%/_0.25),_transparent_60%)]" />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Asakiri" className="size-10" />
            <span className="text-lg font-semibold">Asakiri</span>
          </Link>
        </div>
        <div className="relative">
          <div className="rounded-xl border border-border/70 bg-background/50 p-6 shadow-lg backdrop-blur">
            <p className="text-sm leading-relaxed">
              &ldquo;Creating courses on Asakiri is incredibly intuitive.
              I was able to build a full Cornish language course with
              exercises in just a few days.&rdquo;
            </p>
            <p className="text-muted-foreground mt-4 text-sm font-medium">
              — Course Creator
            </p>
          </div>
        </div>
      </div>

      {/* Main form */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Asakiri" className="size-8" />
            <span className="font-semibold">Asakiri</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create your account
              </h1>
              <p className="text-muted-foreground mt-2">
                The first account created becomes the platform admin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <Button type="submit" className="w-full" isDisabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-muted-foreground mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-foreground font-medium underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
