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
