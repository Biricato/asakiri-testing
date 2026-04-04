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
