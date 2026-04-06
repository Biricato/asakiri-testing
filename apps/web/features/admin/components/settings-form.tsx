"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Input, TextArea, Select, Card, ListBox, Label } from "@heroui/react"
import { updateSettings } from "../actions/settings"
import { ImageUpload } from "./image-upload"
import type { SiteSettings } from "../types"

type CourseOption = { slug: string; title: string }

export function SettingsForm({ settings, courses = [] }: { settings: SiteSettings; courses?: CourseOption[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mobileCourses, setMobileCourses] = useState<string[]>(() => {
    try { return JSON.parse(settings.mobile_courses) } catch { return [] }
  })

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
        site_logo: formData.get("site_logo") as string,
        site_favicon: formData.get("site_favicon") as string,
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
        featured_course_1: formData.get("featured_course_1") as string,
        featured_course_2: formData.get("featured_course_2") as string,
        featured_course_3: formData.get("featured_course_3") as string,
        mobile_courses: formData.get("mobile_courses") as string,
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
            <Label>Site Logo</Label>
            <ImageUpload name="site_logo" value={settings.site_logo} accept="image/svg+xml,image/png,image/jpeg,image/webp" label="Site logo" />
            <p className="text-muted text-xs">Shown in headers. Falls back to /logo.svg if empty.</p>
          </div>
          <div className="grid gap-1.5">
            <Label>Favicon</Label>
            <ImageUpload name="site_favicon" value={settings.site_favicon} accept="image/x-icon,image/png,image/svg+xml" label="Favicon" />
            <p className="text-muted text-xs">Browser tab icon. Falls back to /favicon.ico if empty.</p>
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
          <Card.Title>Homepage — Featured Courses</Card.Title>
          <Card.Description>Highlight up to 3 courses above the main catalog. Leave empty to hide.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          {[1, 2, 3].map((n) => {
            const key = `featured_course_${n}` as keyof SiteSettings
            return (
              <div key={n} className="grid gap-1.5">
                <Label htmlFor={key}>Featured course {n}</Label>
                <select
                  id={key}
                  name={key}
                  defaultValue={settings[key]}
                  className="w-full rounded-lg border border-[var(--field-border)] bg-[var(--field-background)] px-3 py-2 text-sm text-[var(--field-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                >
                  <option value="">None</option>
                  {courses.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.title}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Mobile App Courses</Card.Title>
          <Card.Description>Select which courses are visible in the mobile app. If none are selected, all courses will be shown.</Card.Description>
        </Card.Header>
        <Card.Content>
          <input type="hidden" name="mobile_courses" value={JSON.stringify(mobileCourses)} />
          {courses.length === 0 ? (
            <p className="text-muted text-sm">No published courses yet.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mobileCourses.includes(c.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMobileCourses([...mobileCourses, c.slug])
                      } else {
                        setMobileCourses(mobileCourses.filter((s) => s !== c.slug))
                      }
                    }}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{c.title}</span>
                </label>
              ))}
            </div>
          )}
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
