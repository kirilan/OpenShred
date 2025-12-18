import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  userId: string | null
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  setSession: (userId: string, token: string) => void
  setToken: (token: string | null) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user: User) =>
        set({
          userId: user.id,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setSession: (userId: string, token: string) =>
        set({
          userId,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      setToken: (token: string | null) =>
        set({
          token,
          isAuthenticated: !!token,
        }),

      clearAuth: () =>
        set({
          userId: null,
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ userId: state.userId, token: state.token }),
    }
  )
)
