/**
 * Import data exported from asakiri-current (Supabase) into the new platform.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... bun run scripts/import-data.ts ./export.json
 *
 * Maps old schema → new schema:
 *   profiles + teachers → user (Better Auth)
 *   courses + course_details → course
 *   units → unit
 *   unit_path_nodes → unitNode
 *   lessons → lesson
 *   section_versions → section (latest version per section)
 *   course_exercise_groups → exerciseGroup
 *   course_exercise_items → exerciseItem
 *   course_exercise_variants → exerciseVariant
 *   course_exercise_variant_options → exerciseOption
 *   published_courses → publishedCourse
 *   enrollments → enrollment
 *   lesson_progress → lessonProgress
 *   exercise_attempts → exerciseAttempt
 *   srs_review → srsReview
 */

import { readFileSync } from "fs"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../schema"

const file = process.argv[2]
if (!file) {
  console.error("Usage: bun run scripts/import-data.ts <export.json>")
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error("Set DATABASE_URL")
  process.exit(1)
}

const sql = neon(url)
const db = drizzle(sql, { schema })

const data = JSON.parse(readFileSync(file, "utf-8"))

async function importUsers() {
  console.log("Importing users...")
  const profiles = data.profiles as { id: string; email: string; created_at: string }[]
  const teachers = data.teachers as { profile_id: string; display_name: string; avatar_url: string | null }[]
  const teacherMap = new Map(teachers.map((t) => [t.profile_id, t]))

  let count = 0
  for (const p of profiles) {
    const teacher = teacherMap.get(p.id)
    try {
      await db.insert(schema.user).values({
        id: p.id,
        name: teacher?.display_name ?? p.email.split("@")[0] ?? "User",
        email: p.email,
        emailVerified: true,
        image: teacher?.avatar_url ?? null,
        role: teacher ? "creator" : "learner",
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped user ${p.email}: ${err}`)
    }
  }
  console.log(`  → ${count} users imported`)
}

async function importCourses() {
  console.log("Importing courses...")
  const courses = data.courses as any[]
  const details = data.course_details as any[]
  const detailMap = new Map(details.map((d: any) => [d.course_id, d]))

  let count = 0
  for (const c of courses) {
    const d = detailMap.get(c.id)
    try {
      await db.insert(schema.course).values({
        id: c.id,
        title: c.name,
        subtitle: c.subtitle ?? c.short_description ?? null,
        description: c.description ?? null,
        targetLanguage: d?.target_language ?? "Unknown",
        sourceLanguage: d?.language_taught_in ?? "English",
        difficulty: d?.difficulty ?? "beginner",
        coverImageUrl: c.cover_image_url ?? d?.cover_image_url ?? null,
        isPublished: false,
        createdBy: c.created_by,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped course ${c.name}: ${err}`)
    }
  }
  console.log(`  → ${count} courses imported`)
}

async function importUnits() {
  console.log("Importing units...")
  const units = data.units as any[]
  let count = 0
  for (const u of units) {
    try {
      await db.insert(schema.unit).values({
        id: u.id,
        courseId: u.course_id,
        title: u.title,
        order: u.order_index ?? 0,
        createdAt: new Date(u.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped unit ${u.title}: ${err}`)
    }
  }
  console.log(`  → ${count} units imported`)
}

async function importLessons() {
  console.log("Importing lessons...")
  const lessons = data.lessons as any[]
  let count = 0
  for (const l of lessons) {
    try {
      await db.insert(schema.lesson).values({
        id: l.id,
        courseId: l.course_id,
        title: l.title,
        slug: l.slug ?? l.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80) || "untitled",
        status: l.status ?? "draft",
        createdAt: new Date(l.created_at),
        updatedAt: new Date(l.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped lesson ${l.title}: ${err}`)
    }
  }
  console.log(`  → ${count} lessons imported`)
}

async function importSections() {
  console.log("Importing sections...")
  // Use section_versions (latest version per section)
  const versions = data.section_versions as any[]
  const sections = data.sections as any[]

  // Map section_id → section for order info
  const sectionMap = new Map(sections?.map((s: any) => [s.id, s]) ?? [])

  // Group by section_id, take latest
  const latestBySection = new Map<string, any>()
  for (const v of versions) {
    const existing = latestBySection.get(v.section_id)
    if (!existing || new Date(v.created_at) > new Date(existing.created_at)) {
      latestBySection.set(v.section_id, v)
    }
  }

  let count = 0
  for (const [sectionId, v] of latestBySection) {
    const s = sectionMap.get(sectionId)
    try {
      await db.insert(schema.section).values({
        id: sectionId,
        lessonId: s?.lesson_id ?? v.section_id, // fallback
        title: v.title ?? null,
        content: v.content ?? null,
        order: s?.order_index ?? 0,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped section ${sectionId}: ${err}`)
    }
  }
  console.log(`  → ${count} sections imported`)
}

async function importUnitNodes() {
  console.log("Importing unit path nodes...")
  const nodes = data.unit_path_nodes as any[]
  let count = 0
  for (const n of nodes) {
    try {
      await db.insert(schema.unitNode).values({
        id: n.id,
        unitId: n.unit_id,
        type: n.node_type === "exercise_group" ? "exercise_group" : "lesson",
        lessonId: n.lesson_id ?? null,
        exerciseGroupId: n.exercise_group_id ?? null,
        order: n.order_index ?? 0,
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped node ${n.id}: ${err}`)
    }
  }
  console.log(`  → ${count} nodes imported`)
}

async function importExerciseGroups() {
  console.log("Importing exercise groups...")
  const groups = data.course_exercise_groups as any[]
  let count = 0
  for (const g of groups) {
    try {
      await db.insert(schema.exerciseGroup).values({
        id: g.id,
        courseId: g.course_id,
        title: g.title,
        description: g.description ?? null,
        datasetType: g.dataset_type ?? "word_pair",
        createdBy: g.created_by,
        createdAt: new Date(g.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped group ${g.title}: ${err}`)
    }
  }
  console.log(`  → ${count} groups imported`)
}

async function importExerciseItems() {
  console.log("Importing exercise items...")
  const items = data.course_exercise_items as any[]
  let count = 0
  for (const item of items) {
    try {
      await db.insert(schema.exerciseItem).values({
        id: item.id,
        groupId: item.group_id,
        word: item.word ?? item.label ?? "",
        meaning: item.meaning ?? "",
        partOfSpeech: item.part_of_speech ?? null,
        exampleSentence: item.example_sentence ?? null,
        order: item.order_index ?? 0,
        createdAt: new Date(item.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped item ${item.id}: ${err}`)
    }
  }
  console.log(`  → ${count} items imported`)
}

async function importExerciseVariants() {
  console.log("Importing exercise variants...")
  const variants = data.course_exercise_variants as any[]
  let count = 0
  for (const v of variants) {
    try {
      await db.insert(schema.exerciseVariant).values({
        id: v.id,
        itemId: v.item_id,
        groupId: v.group_id,
        type: v.variant_type ?? v.type ?? "word_cloze",
        prompt: v.prompt ?? {},
        solution: v.solution ?? {},
        difficulty: v.difficulty ?? null,
        order: v.order_index ?? 0,
        createdAt: new Date(v.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped variant ${v.id}: ${err}`)
    }
  }
  console.log(`  → ${count} variants imported`)
}

async function importExerciseOptions() {
  console.log("Importing exercise options...")
  const options = data.course_exercise_variant_options as any[]
  let count = 0
  for (const o of options) {
    try {
      await db.insert(schema.exerciseOption).values({
        id: o.id,
        variantId: o.variant_id,
        label: o.label ?? "",
        value: o.value ?? o.label ?? "",
        isCorrect: o.is_correct ?? false,
        order: o.order_index ?? 0,
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped option ${o.id}: ${err}`)
    }
  }
  console.log(`  → ${count} options imported`)
}

async function importPublishedCourses() {
  console.log("Importing published courses...")
  const pubs = data.published_courses as any[]
  let count = 0
  for (const p of pubs) {
    try {
      await db.insert(schema.publishedCourse).values({
        id: p.id,
        courseId: p.course_id,
        slug: p.slug ?? `course-${p.course_id.slice(0, 8)}`,
        version: 1,
        isListed: p.is_listed ?? true,
        publishedAt: new Date(p.published_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped published course ${p.id}: ${err}`)
    }
  }
  console.log(`  → ${count} published courses imported`)
}

async function importEnrollments() {
  console.log("Importing enrollments...")
  const enrollments = data.enrollments as any[]
  let count = 0
  for (const e of enrollments) {
    try {
      await db.insert(schema.enrollment).values({
        id: e.id,
        publishedCourseId: e.published_course_id,
        userId: e.learner_profile_id ?? e.user_id,
        status: "active",
        enrolledAt: new Date(e.enrolled_at ?? e.created_at),
      }).onConflictDoNothing()
      count++
    } catch (err) {
      console.warn(`  Skipped enrollment ${e.id}: ${err}`)
    }
  }
  console.log(`  → ${count} enrollments imported`)
}

async function main() {
  console.log(`\nImporting from ${file}...`)
  console.log(`Exported at: ${data.exportedAt}\n`)

  // Order matters due to foreign keys
  await importUsers()
  await importCourses()
  await importUnits()
  await importLessons()
  await importSections()
  await importUnitNodes()
  await importExerciseGroups()
  await importExerciseItems()
  await importExerciseVariants()
  await importExerciseOptions()
  await importPublishedCourses()
  await importEnrollments()

  console.log("\nImport complete!")
}

main().catch((err) => {
  console.error("Import failed:", err)
  process.exit(1)
})
