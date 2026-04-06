import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getSettings } from "@/features/admin/actions/settings"

export default async function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings().catch(() => null)

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  )
}
