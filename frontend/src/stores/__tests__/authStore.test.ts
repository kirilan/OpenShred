import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import type { User } from '@/types'

describe('authStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().clearAuth()
    })
  })

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    google_id: 'google-123',
    is_admin: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  describe('initial state', () => {
    it('should have correct initial values after clear', () => {
      const state = useAuthStore.getState()

      expect(state.userId).toBeNull()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should set user and update authentication state', () => {
      act(() => {
        useAuthStore.getState().setUser(mockUser)
      })

      const state = useAuthStore.getState()

      expect(state.userId).toBe('user-123')
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setSession', () => {
    it('should set userId and token', () => {
      act(() => {
        useAuthStore.getState().setSession('user-123', 'test-token')
      })

      const state = useAuthStore.getState()

      expect(state.userId).toBe('user-123')
      expect(state.token).toBe('test-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setToken', () => {
    it('should set token and authenticate when token is provided', () => {
      act(() => {
        useAuthStore.getState().setToken('new-token')
      })

      const state = useAuthStore.getState()

      expect(state.token).toBe('new-token')
      expect(state.isAuthenticated).toBe(true)
    })

    it('should clear authentication when token is null', () => {
      // First set a token
      act(() => {
        useAuthStore.getState().setToken('some-token')
      })

      // Then clear it
      act(() => {
        useAuthStore.getState().setToken(null)
      })

      const state = useAuthStore.getState()

      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('clearAuth', () => {
    it('should reset all auth state', () => {
      // First set some state
      act(() => {
        useAuthStore.getState().setUser(mockUser)
        useAuthStore.getState().setToken('test-token')
      })

      // Verify state is set
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Clear auth
      act(() => {
        useAuthStore.getState().clearAuth()
      })

      const state = useAuthStore.getState()

      expect(state.userId).toBeNull()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      act(() => {
        useAuthStore.getState().setLoading(true)
      })

      expect(useAuthStore.getState().isLoading).toBe(true)

      act(() => {
        useAuthStore.getState().setLoading(false)
      })

      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })
})
