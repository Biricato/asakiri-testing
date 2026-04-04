import Link from "next/link"
import { Button } from "@heroui/react"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link href="/"><Button>Go home</Button></Link>
    </div>
  )
}
