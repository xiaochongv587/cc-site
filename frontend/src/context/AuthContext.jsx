import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, tokenStore } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStore.get()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((data) => setUser(data))
      .catch(() => {
        tokenStore.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const data = await authApi.login({ username, password })
    tokenStore.set(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    tokenStore.clear()
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: !!user }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
