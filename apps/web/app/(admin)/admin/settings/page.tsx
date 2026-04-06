import { getSettings } from "@/features/admin/actions/settings"
import { getCatalog } from "@/features/publish/actions/catalog"
import { SettingsForm } from "@/features/admin/components/settings-form"

export default async function AdminSettingsPage() {
  const [settings, allCourses] = await Promise.all([
    getSettings(),
    getCatalog().catch(() => []),
  ])

  const courses = allCourses.map((c) => ({ slug: c.slug, title: c.title }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-2">
        Configure platform-wide settings.
      </p>
      <div className="mt-6 max-w-2xl">
        <SettingsForm settings={settings} courses={courses} />
      </div>
    </div>
  )
}
