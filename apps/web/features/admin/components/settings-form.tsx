"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { updateSettings } from "../actions/settings"
import type { SiteSettings } from "../types"

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const data: SiteSettings = {
        registration_mode: formData.get("registration_mode") as SiteSettings["registration_mode"],
        course_creation: formData.get("course_creation") as SiteSettings["course_creation"],
        default_role: formData.get("default_role") as SiteSettings["default_role"],
      }

      const result = await updateSettings(data)
      if (result.success) {
        toast.success("Settings saved")
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>
            Configure registration, course creation, and default user roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="registration_mode">Registration Mode</Label>
            <Select
              name="registration_mode"
              defaultValue={settings.registration_mode}
            >
              <SelectTrigger id="registration_mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="invite_only">Invite Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Controls whether anyone can sign up or only invited users.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_creation">Course Creation Policy</Label>
            <Select
              name="course_creation"
              defaultValue={settings.course_creation}
            >
              <SelectTrigger id="course_creation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open (any creator)</SelectItem>
                <SelectItem value="approved">Approved creators only</SelectItem>
                <SelectItem value="admin_only">Admin only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Who can create new courses on the platform.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_role">Default New User Role</Label>
            <Select
              name="default_role"
              defaultValue={settings.default_role}
            >
              <SelectTrigger id="default_role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learner">Learner</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Role assigned to new users when they sign up.
            </p>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save settings"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
