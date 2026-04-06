import * as SecureStore from "expo-secure-store"

const API_URL = "https://asakiri.com"

export let sessionToken: string | null = null

export async function loadToken() {
  try {
    sessionToken = await SecureStore.getItemAsync("session_token")
  } catch {
    sessionToken = null
  }
}

export async function saveToken(token: string) {
  sessionToken = token
  await SecureStore.setItemAsync("session_token", token)
}

export async function clearToken() {
  sessionToken = null
  await SecureStore.deleteItemAsync("session_token")
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (sessionToken) {
    headers["Cookie"] = `better-auth.session_token=${sessionToken}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout))

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }

  return res.json()
}

// Auth helpers
export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Sign in failed")
  }

  // Extract session token from set-cookie
  const cookies = res.headers.get("set-cookie") ?? ""
  const match = cookies.match(/better-auth\.session_token=([^;]+)/)
  if (match?.[1]) {
    await saveToken(match[1])
  }

  return res.json()
}

export async function signUp(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Sign up failed")
  }

  const cookies = res.headers.get("set-cookie") ?? ""
  const match = cookies.match(/better-auth\.session_token=([^;]+)/)
  if (match?.[1]) {
    await saveToken(match[1])
  }

  return res.json()
}

export async function signOut() {
  await fetch(`${API_URL}/api/auth/sign-out`, {
    method: "POST",
    headers: sessionToken
      ? { Cookie: `better-auth.session_token=${sessionToken}` }
      : {},
  }).catch(() => {})
  await clearToken()
}
