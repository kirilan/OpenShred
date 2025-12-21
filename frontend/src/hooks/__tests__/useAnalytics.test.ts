import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/test/utils'
import { useAuthStore } from '@/stores/authStore'
import { useAnalytics, useBrokerRanking, useTimeline } from '../useAnalytics'

describe('useAnalytics hooks', () => {
  beforeEach(() => {
    // Set up authenticated user for the store
    act(() => {
      useAuthStore.setState({
        userId: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true,
        isLoading: false,
      })
    })
  })

  describe('useAnalytics', () => {
    it('should fetch analytics stats when userId is present', async () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.total_requests).toBe(10)
      expect(result.current.data?.success_rate).toBe(60)
      expect(result.current.data?.confirmed_deletions).toBe(3)
    })

    it('should handle loading state', () => {
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createQueryWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should not fetch when userId is not present', () => {
      act(() => {
        useAuthStore.setState({ userId: null })
      })

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createQueryWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useBrokerRanking', () => {
    it('should fetch broker ranking', async () => {
      const { result } = renderHook(() => useBrokerRanking(), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].broker_name).toBe('Test Broker')
    })
  })

  describe('useTimeline', () => {
    it('should fetch timeline data', async () => {
      const { result } = renderHook(() => useTimeline(30), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data?.[0].date).toBe('2024-01-01')
    })
  })
})
