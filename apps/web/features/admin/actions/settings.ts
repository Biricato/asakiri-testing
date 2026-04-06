"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSetting } from "@/schema/settings"
import { type SiteSettings, defaultSettings } from "../types"

export async function getSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(siteSetting)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return {
    registration_mode:
      (map.registration_mode as SiteSettings["registration_mode"]) ??
      defaultSettings.registration_mode,
    course_creation:
      (map.course_creation as SiteSettings["course_creation"]) ??
      defaultSettings.course_creation,
    default_role:
      (map.default_role as SiteSettings["default_role"]) ??
      defaultSettings.default_role,
    site_name: map.site_name ?? defaultSettings.site_name,
    hero_title: map.hero_title ?? defaultSettings.hero_title,
    hero_description: map.hero_description ?? defaultSettings.hero_description,
    site_tagline: map.site_tagline ?? defaultSettings.site_tagline,
    github_url: map.github_url ?? defaultSettings.github_url,
    discord_url: map.discord_url ?? defaultSettings.discord_url,
    show_github_button:
      (map.show_github_button as SiteSettings["show_github_button"]) ??
      defaultSettings.show_github_button,
    show_deploy_button:
      (map.show_deploy_button as SiteSettings["show_deploy_button"]) ??
      defaultSettings.show_deploy_button,
    privacy_policy: map.privacy_policy ?? defaultSettings.privacy_policy,
    terms_of_service: map.terms_of_service ?? defaultSettings.terms_of_service,
  }
}

export async function updateSettings(
  data: SiteSettings,
): Promise<{ success: boolean }> {
  const entries = Object.entries(data) as [string, string][]

  for (const [key, value] of entries) {
    const existing = await db
      .select()
      .from(siteSetting)
      .where(eq(siteSetting.key, key))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(siteSetting)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSetting.key, key))
    } else {
      await db.insert(siteSetting).values({ key, value })
    }
  }

  return { success: true }
}
