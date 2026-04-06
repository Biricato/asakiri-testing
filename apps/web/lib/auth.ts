import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins/admin"
import { hashPassword as defaultHash, verifyPassword as defaultVerify } from "better-auth/crypto"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import { db } from "./db"
import * as schema from "@/schema"

const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_FROM)

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      ...(process.env.SMTP_USER && {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }),
    })
  : null

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
    requireEmailVerification: smtpConfigured,
    password: {
      hash: defaultHash,
      verify: async ({ hash, password }) => {
        // Support legacy bcrypt hashes from Supabase migration
        if (hash.startsWith("$2a$") || hash.startsWith("$2b$")) {
          return bcrypt.compare(password, hash)
        }
        // Default scrypt verification for Better Auth native hashes
        return defaultVerify({ hash, password })
      },
    },
  },
  emailVerification: {
    sendOnSignUp: smtpConfigured,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!transporter) return
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: "Verify your email — Asakiri",
        html: `<p>Click the link below to verify your email address:</p><p><a href="${url}">Verify email</a></p>`,
      })
    },
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
