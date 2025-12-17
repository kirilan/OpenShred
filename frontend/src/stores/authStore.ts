import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  userId: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (userId: string, user: User) => void
  setUserId: (userId: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (userId: string, user: User) =>
        set({
          userId,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setUserId: (userId: string) =>
        set({
          userId,
          isLoading: false,
        }),

      clearAuth: () =>
        set({
          userId: null,
          user: null,
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
      partialize: (state) => ({ userId: state.userId }),
    }
  )
)
