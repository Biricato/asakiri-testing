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
// These methods exist on the client proxy at runtime but TS can't infer
// them without the server config. Cast through the proxy to access them.
const client = authClient as Record<string, any>
export const forgetPassword = client.forgetPassword as (opts: {
  email: string
  redirectTo: string
}) => Promise<{ data: unknown; error: { message: string } | null }>
export const resetPassword = client.resetPassword as (opts: {
  newPassword: string
  token: string
}) => Promise<{ data: unknown; error: { message: string } | null }>
export const sendVerificationEmail = client.sendVerificationEmail as (opts: {
  email: string
}) => Promise<{ data: unknown; error: { message: string } | null }>
