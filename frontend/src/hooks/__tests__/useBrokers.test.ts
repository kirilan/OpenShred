import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useBrokers, useBroker, useSyncBrokers, useCreateBroker } from '../useBrokers'
import { createQueryWrapper } from '@/test/utils'
import { mockBroker } from '@/test/mocks/handlers'

describe('useBrokers hooks', () => {
  describe('useBrokers', () => {
    it('should fetch brokers list', async () => {
      const { result } = renderHook(() => useBrokers(), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([mockBroker])
    })

    it('should handle loading state', () => {
      const { result } = renderHook(() => useBrokers(), {
        wrapper: createQueryWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useBroker', () => {
    it('should fetch a single broker by ID', async () => {
      const { result } = renderHook(() => useBroker('broker-123'), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.id).toBe('broker-123')
      expect(result.current.data?.name).toBe('Test Broker')
    })

    it('should not fetch when brokerId is empty', () => {
      const { result } = renderHook(() => useBroker(''), {
        wrapper: createQueryWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useSyncBrokers', () => {
    it('should sync brokers and invalidate queries', async () => {
      const { result } = renderHook(() => useSyncBrokers(), {
        wrapper: createQueryWrapper(),
      })

      act(() => {
        result.current.mutate()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.message).toContain('Synced')
    })
  })

  describe('useCreateBroker', () => {
    it('should create a new broker', async () => {
      const newBroker = {
        name: 'New Broker',
        website: 'https://newbroker.com',
        privacy_email: 'privacy@newbroker.com',
        domains: ['newbroker.com'],
        category: 'Marketing',
      }

      const { result } = renderHook(() => useCreateBroker(), {
        wrapper: createQueryWrapper(),
      })

      act(() => {
        result.current.mutate(newBroker)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.id).toBe('new-broker-123')
      expect(result.current.data?.name).toBe('New Broker')
    })
  })
})
