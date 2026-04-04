"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, TextArea, Select, Card, ListBox, Label } from "@heroui/react"
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
        site_name: formData.get("site_name") as string,
        site_tagline: formData.get("site_tagline") as string,
        hero_title: formData.get("hero_title") as string,
        hero_description: formData.get("hero_description") as string,
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
        <Card.Header>
          <Card.Title>Platform Settings</Card.Title>
          <Card.Description>
            Configure registration, course creation, and default user roles.
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div className="grid gap-1.5">
            <Label htmlFor="site_name">Site Name</Label>
            <Input id="site_name" name="site_name" defaultValue={settings.site_name} className="w-full" />
            <p className="text-muted text-xs">Shown in the header, footer, and browser tab.</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="site_tagline">Tagline</Label>
            <Input id="site_tagline" name="site_tagline" defaultValue={settings.site_tagline} className="w-full" />
            <p className="text-muted text-xs">Short label shown above the hero title.</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="hero_title">Hero Title</Label>
            <TextArea id="hero_title" name="hero_title" defaultValue={settings.hero_title} rows={2} className="w-full" />
            <p className="text-muted text-xs">Main heading on the landing page.</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="hero_description">Hero Description</Label>
            <TextArea id="hero_description" name="hero_description" defaultValue={settings.hero_description} rows={3} className="w-full" />
            <p className="text-muted text-xs">Supporting text below the hero title.</p>
          </div>

          <div className="grid gap-1.5">
            <Label>Registration Mode</Label>
            <Select name="registration_mode" defaultSelectedKey={settings.registration_mode} aria-label="Registration Mode" className="w-full">
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="open" textValue="Open">Open</ListBox.Item>
                  <ListBox.Item id="invite_only" textValue="Invite Only">Invite Only</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <p className="text-muted text-xs">Controls whether anyone can sign up or only invited users.</p>
          </div>

          <div className="grid gap-1.5">
            <Label>Course Creation Policy</Label>
            <Select name="course_creation" defaultSelectedKey={settings.course_creation} aria-label="Course Creation Policy" className="w-full">
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="open" textValue="Open (any creator)">Open (any creator)</ListBox.Item>
                  <ListBox.Item id="approved" textValue="Approved creators only">Approved creators only</ListBox.Item>
                  <ListBox.Item id="admin_only" textValue="Admin only">Admin only</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <p className="text-muted text-xs">Who can create new courses on the platform.</p>
          </div>

          <div className="grid gap-1.5">
            <Label>Default New User Role</Label>
            <Select name="default_role" defaultSelectedKey={settings.default_role} aria-label="Default New User Role" className="w-full">
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="learner" textValue="Learner">Learner</ListBox.Item>
                  <ListBox.Item id="creator" textValue="Creator">Creator</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <p className="text-muted text-xs">Role assigned to new users when they sign up.</p>
          </div>

          <Button type="submit" isDisabled={pending}>
            {pending ? "Saving..." : "Save settings"}
          </Button>
        </Card.Content>
      </Card>
    </form>
  )
}
