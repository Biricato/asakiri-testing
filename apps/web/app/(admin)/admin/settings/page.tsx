import { getSettings } from "@/features/admin/actions/settings"
import { SettingsForm } from "@/features/admin/components/settings-form"

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-2">
        Configure platform-wide settings.
      </p>
      <div className="mt-6 max-w-2xl">
        <SettingsForm settings={settings} />
      </div>
    </div>
  )
}
