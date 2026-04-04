import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins/admin"
import { db } from "./db"
import * as schema from "@/schema"

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me-in-production",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    }),
  },
  plugins: [
    admin({
      defaultRole: "learner",
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // First user to sign up becomes admin
          try {
            const result = await db
              .select({ id: schema.user.id })
              .from(schema.user)
              .limit(1)
            if (result.length === 0) {
              return { data: { ...user, role: "admin" } }
            }
          } catch {
            // DB not available (e.g., during build) — skip
          }
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
