import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useRateLimitStore, RateLimitNotice } from '../rateLimitStore'

describe('rateLimitStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useRateLimitStore.getState().clearNotice()
    })
  })

  const mockNotice: RateLimitNotice = {
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: 60,
    triggeredAt: Date.now(),
  }

  describe('initial state', () => {
    it('should have null notice initially', () => {
      const state = useRateLimitStore.getState()
      expect(state.notice).toBeNull()
    })
  })

  describe('setNotice', () => {
    it('should set the rate limit notice', () => {
      act(() => {
        useRateLimitStore.getState().setNotice(mockNotice)
      })

      const state = useRateLimitStore.getState()

      expect(state.notice).toEqual(mockNotice)
      expect(state.notice?.message).toBe('Rate limit exceeded. Please try again later.')
      expect(state.notice?.retryAfter).toBe(60)
    })

    it('should replace existing notice with new one', () => {
      act(() => {
        useRateLimitStore.getState().setNotice(mockNotice)
      })

      const newNotice: RateLimitNotice = {
        message: 'New rate limit notice',
        retryAfter: 120,
        triggeredAt: Date.now(),
      }

      act(() => {
        useRateLimitStore.getState().setNotice(newNotice)
      })

      const state = useRateLimitStore.getState()

      expect(state.notice?.message).toBe('New rate limit notice')
      expect(state.notice?.retryAfter).toBe(120)
    })
  })

  describe('clearNotice', () => {
    it('should clear the rate limit notice', () => {
      // First set a notice
      act(() => {
        useRateLimitStore.getState().setNotice(mockNotice)
      })

      // Verify it's set
      expect(useRateLimitStore.getState().notice).not.toBeNull()

      // Clear it
      act(() => {
        useRateLimitStore.getState().clearNotice()
      })

      expect(useRateLimitStore.getState().notice).toBeNull()
    })

    it('should be idempotent when notice is already null', () => {
      act(() => {
        useRateLimitStore.getState().clearNotice()
      })

      expect(useRateLimitStore.getState().notice).toBeNull()
    })
  })
})
