import * as SecureStore from "expo-secure-store"

let API_URL = "https://asakiri.com"

export async function loadServerUrl() {
  const stored = await SecureStore.getItemAsync("server_url").catch(() => null)
  if (stored) API_URL = stored
}

export async function setServerUrl(url: string) {
  const clean = url.replace(/\/+$/, "")
  API_URL = clean
  await SecureStore.setItemAsync("server_url", clean)
}

export function getServerUrl() {
  return API_URL
}

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
    "Origin": API_URL,
    ...(options.headers as Record<string, string>),
  }

  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`
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
    headers: { "Content-Type": "application/json", "Origin": API_URL },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Sign in failed")
  }

  const data = await res.json()

  // Better Auth returns token in response body
  const token = data?.token ?? data?.session?.token
  console.log("[Auth] sign-in response keys:", Object.keys(data))
  console.log("[Auth] token found:", token ? token.slice(0, 20) + "..." : "none")
  if (token) {
    await saveToken(token)
    console.log("[Auth] token saved from response body")
  } else {
    console.log("[Auth] full response:", JSON.stringify(data).slice(0, 500))
  }

  return data
}

export async function signUp(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": API_URL },
    body: JSON.stringify({ name, email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? "Sign up failed")
  }

  const data = await res.json()

  const token = data?.token ?? data?.session?.token
  if (token) {
    await saveToken(token)
  } else {
    const cookies = res.headers.get("set-cookie") ?? ""
    const match = cookies.match(/better-auth\.session_token=([^;]+)/)
    if (match?.[1]) {
      await saveToken(match[1])
    }
  }

  return data
}

export async function signOut() {
  await fetch(`${API_URL}/api/auth/sign-out`, {
    method: "POST",
    headers: {
      "Origin": API_URL,
      ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {}),
    },
  }).catch(() => {})
  await clearToken()
}
