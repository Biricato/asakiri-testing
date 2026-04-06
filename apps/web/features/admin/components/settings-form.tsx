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
        github_url: formData.get("github_url") as string,
        discord_url: formData.get("discord_url") as string,
        support_email: formData.get("support_email") as string,
        show_github_button: formData.get("show_github_button") as SiteSettings["show_github_button"],
        show_deploy_button: formData.get("show_deploy_button") as SiteSettings["show_deploy_button"],
        privacy_policy: formData.get("privacy_policy") as string,
        terms_of_service: formData.get("terms_of_service") as string,
        how_it_works: formData.get("how_it_works") as string,
        features: formData.get("features") as string,
        for_teachers: formData.get("for_teachers") as string,
        for_teachers_title: formData.get("for_teachers_title") as string,
        for_teachers_description: formData.get("for_teachers_description") as string,
        for_teachers_cta: formData.get("for_teachers_cta") as string,
        faq: formData.get("faq") as string,
      }

      const result = await updateSettings(data)
      if (result.success) {
        toast.success("Settings saved")
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General */}
      <Card>
        <Card.Header>
          <Card.Title>General</Card.Title>
          <Card.Description>Site identity and branding.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div className="grid gap-1.5">
            <Label htmlFor="site_name">Site Name</Label>
            <Input id="site_name" name="site_name" defaultValue={settings.site_name} className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="site_tagline">Tagline</Label>
            <Input id="site_tagline" name="site_tagline" defaultValue={settings.site_tagline} className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="support_email">Support / Privacy Email</Label>
            <Input id="support_email" name="support_email" type="email" defaultValue={settings.support_email} placeholder="support@yourdomain.com" className="w-full" />
            <p className="text-muted text-xs">Shown in the FAQ section and used as contact for privacy/terms pages.</p>
          </div>
        </Card.Content>
      </Card>

      {/* Access Control */}
      <Card>
        <Card.Header>
          <Card.Title>Access Control</Card.Title>
          <Card.Description>Registration, roles, and course creation policies.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
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
          </div>
        </Card.Content>
      </Card>

      {/* Links & Buttons */}
      <Card>
        <Card.Header>
          <Card.Title>Links &amp; Buttons</Card.Title>
          <Card.Description>External links shown in the header and footer.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div className="grid gap-1.5">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input id="github_url" name="github_url" defaultValue={settings.github_url} placeholder="https://github.com/your-org/your-repo" className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="discord_url">Discord URL</Label>
            <Input id="discord_url" name="discord_url" defaultValue={settings.discord_url} placeholder="https://discord.gg/invite-code" className="w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Show GitHub Button</Label>
              <Select name="show_github_button" defaultSelectedKey={settings.show_github_button} aria-label="Show GitHub Button" className="w-full">
                <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="true" textValue="Yes">Yes</ListBox.Item>
                    <ListBox.Item id="false" textValue="No">No</ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Show Deploy Button</Label>
              <Select name="show_deploy_button" defaultSelectedKey={settings.show_deploy_button} aria-label="Show Deploy Button" className="w-full">
                <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="true" textValue="Yes">Yes</ListBox.Item>
                    <ListBox.Item id="false" textValue="No">No</ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Homepage Sections */}
      <Card>
        <Card.Header>
          <Card.Title>Homepage — Hero</Card.Title>
          <Card.Description>Main banner content on the landing page.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div className="grid gap-1.5">
            <Label htmlFor="hero_title">Hero Title</Label>
            <TextArea id="hero_title" name="hero_title" defaultValue={settings.hero_title} rows={2} className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="hero_description">Hero Description</Label>
            <TextArea id="hero_description" name="hero_description" defaultValue={settings.hero_description} rows={3} className="w-full" />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Homepage — How It Works</Card.Title>
          <Card.Description>Steps shown below the hero. JSON array of objects with &ldquo;title&rdquo; and &ldquo;description&rdquo;. Empty array hides the section.</Card.Description>
        </Card.Header>
        <Card.Content>
          <TextArea name="how_it_works" defaultValue={settings.how_it_works} rows={8} className="w-full font-mono text-xs" />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Homepage — Features</Card.Title>
          <Card.Description>Feature grid. JSON array of objects with &ldquo;title&rdquo; and &ldquo;description&rdquo;. Empty array hides the section.</Card.Description>
        </Card.Header>
        <Card.Content>
          <TextArea name="features" defaultValue={settings.features} rows={10} className="w-full font-mono text-xs" />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Homepage — For Teachers</Card.Title>
          <Card.Description>Teacher-focused section. Clear the title to hide.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div className="grid gap-1.5">
            <Label htmlFor="for_teachers_title">Title</Label>
            <Input id="for_teachers_title" name="for_teachers_title" defaultValue={settings.for_teachers_title} className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="for_teachers_description">Description</Label>
            <TextArea id="for_teachers_description" name="for_teachers_description" defaultValue={settings.for_teachers_description} rows={2} className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="for_teachers_cta">Button Text</Label>
            <Input id="for_teachers_cta" name="for_teachers_cta" defaultValue={settings.for_teachers_cta} className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label>Features (JSON)</Label>
            <TextArea name="for_teachers" defaultValue={settings.for_teachers} rows={6} className="w-full font-mono text-xs" />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Homepage — FAQ</Card.Title>
          <Card.Description>FAQ accordion. JSON array of objects with &ldquo;question&rdquo; and &ldquo;answer&rdquo;. Empty array hides the section.</Card.Description>
        </Card.Header>
        <Card.Content>
          <TextArea name="faq" defaultValue={settings.faq} rows={10} className="w-full font-mono text-xs" />
        </Card.Content>
      </Card>

      {/* Legal */}
      <Card>
        <Card.Header>
          <Card.Title>Legal</Card.Title>
          <Card.Description>Privacy policy and terms of service. Leave empty to hide footer links.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div className="grid gap-1.5">
            <Label htmlFor="privacy_policy">Privacy Policy</Label>
            <TextArea id="privacy_policy" name="privacy_policy" defaultValue={settings.privacy_policy} rows={6} className="w-full" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="terms_of_service">Terms of Service</Label>
            <TextArea id="terms_of_service" name="terms_of_service" defaultValue={settings.terms_of_service} rows={6} className="w-full" />
          </div>
        </Card.Content>
      </Card>

      <Button type="submit" isDisabled={pending} className="w-full">
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  )
}
