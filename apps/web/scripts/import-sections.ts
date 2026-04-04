/**
 * Fix import for sections.
 * Chain: section_versions.section_id → sections.lesson_version_id → lesson_versions.lesson_id
 */

import { readFileSync } from "fs"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../schema"

const file = process.argv[2]
if (!file) { console.error("Usage: bun run scripts/import-sections.ts <export.json>"); process.exit(1) }
const url = process.env.DATABASE_URL
if (!url) { console.error("Set DATABASE_URL"); process.exit(1) }

const sql = neon(url)
const db = drizzle(sql, { schema })
const data = JSON.parse(readFileSync(file, "utf-8"))

async function main() {
  const sectionRows = data.sections as any[]
  const sectionVersions = data.section_versions as any[]
  const lessonVersions = data.lesson_versions as any[]

  // Build lookup: lesson_version_id → lesson_id
  const lvToLesson = new Map<string, string>()
  for (const lv of lessonVersions) {
    lvToLesson.set(lv.id, lv.lesson_id)
  }

  // Build lookup: section_id → lesson_id (via sections.lesson_version_id → lesson_versions.lesson_id)
  const sectionToLesson = new Map<string, string>()
  for (const s of sectionRows) {
    const lessonId = lvToLesson.get(s.lesson_version_id)
    if (lessonId) {
      sectionToLesson.set(s.id, lessonId)
    }
  }

  // Group section_versions by section_id, take latest
  const latestBySection = new Map<string, any>()
  for (const v of sectionVersions) {
    const existing = latestBySection.get(v.section_id)
    if (!existing || new Date(v.created_at) > new Date(existing.created_at)) {
      latestBySection.set(v.section_id, v)
    }
  }

  console.log(`Sections: ${sectionRows.length}, Versions: ${sectionVersions.length}, Unique: ${latestBySection.size}`)
  console.log(`Mapped to lessons: ${sectionToLesson.size}`)

  let imported = 0
  let skipped = 0

  for (const [sectionId, v] of latestBySection) {
    const lessonId = sectionToLesson.get(sectionId)
    if (!lessonId) {
      skipped++
      continue
    }

    const s = sectionRows.find((r: any) => r.id === sectionId)

    try {
      await db.insert(schema.section).values({
        id: sectionId,
        lessonId,
        title: v.title ?? null,
        content: v.content ?? null,
        order: s?.order_index ?? 0,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.created_at),
      }).onConflictDoNothing()
      imported++
    } catch (err) {
      skipped++
    }
  }

  console.log(`\nImported: ${imported}, Skipped: ${skipped}`)
}

main().catch(console.error)
