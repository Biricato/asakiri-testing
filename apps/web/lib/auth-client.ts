"use client"

import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [adminClient()],
})

export const useSession = authClient.useSession
export const signIn = authClient.signIn
export const signUp = authClient.signUp
export const signOut = authClient.signOut
export const { $fetch } = authClient

export async function forgetPassword(opts: { email: string; redirectTo: string }) {
  return $fetch("/request-password-reset", {
    method: "POST",
    body: { email: opts.email, redirectTo: opts.redirectTo },
  })
}

export async function resetPassword(opts: { newPassword: string; token: string }) {
  return $fetch("/reset-password", {
    method: "POST",
    body: { newPassword: opts.newPassword, token: opts.token },
  })
}

export async function sendVerificationEmail(opts: { email: string }) {
  return $fetch("/send-verification-email", {
    method: "POST",
    body: { email: opts.email },
  })
}
