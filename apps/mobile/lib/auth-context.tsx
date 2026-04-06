import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api, loadToken, clearToken, signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from "./api"

type User = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
}

type AuthState = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User }>("/api/v1/auth/session")
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    loadToken()
      .then(refresh)
      .finally(() => setLoading(false))
  }, [refresh])

  const signIn = async (email: string, password: string) => {
    await apiSignIn(email, password)
    await refresh()
  }

  const signUp = async (name: string, email: string, password: string) => {
    await apiSignUp(name, email, password)
    await refresh()
  }

  const signOut = async () => {
    await apiSignOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
