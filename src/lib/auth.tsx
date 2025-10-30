import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

type AuthCtx = {
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}
const C = createContext<AuthCtx>(null as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      const t = data?.token
      if (!t) throw new Error('Token missing in response')
      setToken(t)
    } catch (e: any) {
      // Re-throw a clean message for the UI
      throw new Error(e?.message || 'Unable to sign in')
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      await api.post('/api/auth/register', { name, email, password })
      await login(email, password)
    } catch (e: any) {
      throw new Error(e?.message || 'Unable to register')
    }
  }

  function logout() {
    setToken(null)
  }

  return <C.Provider value={{ token, login, register, logout }}>{children}</C.Provider>
}
export const useAuth = () => useContext(C)
