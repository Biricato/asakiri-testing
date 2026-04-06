import { redirect } from "next/navigation"
import Link from "next/link"
import { getSettings } from "@/features/admin/actions/settings"
import { Button } from "@heroui/react"

export default async function PrivacyPage() {
  const settings = await getSettings()

  if (!settings.privacy_policy) redirect("/")

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link href="/"><Button variant="ghost" size="sm" className="mb-6">&larr; Back</Button></Link>
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <div className="prose prose-neutral dark:prose-invert mt-6 whitespace-pre-wrap">
        {settings.privacy_policy}
      </div>
    </div>
  )
}
