"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  user: { id: number; email: string } | null
  token: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = ""

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    const tokenExpiry = localStorage.getItem("tokenExpiry")

    if (savedToken && savedUser && tokenExpiry) {
      // Check if token is expired
      if (new Date().getTime() > Number.parseInt(tokenExpiry)) {
        logout()
      } else {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    setToken(data.token)
    setUser(data.user)

    const expiryDays = rememberMe ? 7 : 1
    const expiryTime = new Date().getTime() + expiryDays * 24 * 60 * 60 * 1000

    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    localStorage.setItem("tokenExpiry", expiryTime.toString())
  }

  const signup = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Signup failed")
    }

    setToken(data.token)
    setUser(data.user)

    const expiryTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000

    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    localStorage.setItem("tokenExpiry", expiryTime.toString())
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("tokenExpiry")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
