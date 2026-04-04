import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  if (!session) redirect("/sign-in")

  return <>{children}</>
}
