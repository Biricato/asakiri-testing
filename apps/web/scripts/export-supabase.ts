/**
 * Export all data from Supabase asakiri-current database.
 *
 * Usage:
 *   SUPABASE_URL=postgresql://... bun run scripts/export-supabase.ts
 *
 * Outputs: export.json in the project root
 */

import postgres from "postgres"
import { writeFileSync } from "fs"

const url = process.env.SUPABASE_URL
if (!url) {
  console.error("Set SUPABASE_URL to your Supabase Postgres connection string")
  process.exit(1)
}

const sql = postgres(url)

async function exportTable(name: string) {
  console.log(`  Exporting ${name}...`)
  const rows = await sql`SELECT * FROM ${sql(name)}`
  console.log(`    → ${rows.length} rows`)
  return rows
}

async function main() {
  console.log("Exporting from Supabase...")

  const data = {
    exportedAt: new Date().toISOString(),
    profiles: await exportTable("profiles"),
    teachers: await exportTable("teachers"),
    learners: await exportTable("learners"),
    courses: await exportTable("courses"),
    course_details: await exportTable("course_details"),
    course_contributors: await exportTable("course_contributors"),
    units: await exportTable("units"),
    unit_path_nodes: await exportTable("unit_path_nodes"),
    lessons: await exportTable("lessons"),
    lesson_versions: await exportTable("lesson_versions"),
    sections: await exportTable("sections"),
    section_versions: await exportTable("section_versions"),
    course_exercise_groups: await exportTable("course_exercise_groups"),
    course_exercise_items: await exportTable("course_exercise_items"),
    course_exercise_variants: await exportTable("course_exercise_variants"),
    course_exercise_variant_options: await exportTable("course_exercise_variant_options"),
    published_courses: await exportTable("published_courses"),
    published_lessons: await exportTable("published_lessons"),
    published_exercises: await exportTable("published_exercises"),
    enrollments: await exportTable("enrollments"),
    lesson_progress: await exportTable("lesson_progress"),
    exercise_attempts: await exportTable("exercise_attempts"),
    srs_review: await exportTable("srs_review"),
  }

  const path = "export.json"
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`\nExported to ${path} (${(JSON.stringify(data).length / 1024).toFixed(0)} KB)`)

  await sql.end()
}

main().catch((err) => {
  console.error("Export failed:", err)
  process.exit(1)
})
