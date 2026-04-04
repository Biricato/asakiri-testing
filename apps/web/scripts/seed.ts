import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { siteSetting } from "../schema/settings"

const defaults = [
  { key: "registration_mode", value: "open" },
  { key: "course_creation", value: "open" },
  { key: "default_role", value: "learner" },
]

async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.log("No DATABASE_URL — skipping seed")
    return
  }

  const sql = neon(url)
  const db = drizzle(sql)

  for (const { key, value } of defaults) {
    try {
      await db
        .insert(siteSetting)
        .values({ key, value })
        .onConflictDoNothing()
    } catch {
      // Already exists — skip
    }
  }

  console.log("Seed complete: default site settings applied")
}

seed().catch(console.error)
