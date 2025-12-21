import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useRequests,
  useRequest,
  useCreateRequest,
  useUpdateRequestStatus,
  useEmailPreview,
} from '../useRequests'
import { createQueryWrapper } from '@/test/utils'
import { useAuthStore } from '@/stores/authStore'
import { mockDeletionRequest } from '@/test/mocks/handlers'

describe('useRequests hooks', () => {
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

  describe('useRequests', () => {
    it('should fetch requests list when userId is present', async () => {
      const { result } = renderHook(() => useRequests(), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([mockDeletionRequest])
    })

    it('should not fetch when userId is not present', () => {
      act(() => {
        useAuthStore.setState({ userId: null })
      })

      const { result } = renderHook(() => useRequests(), {
        wrapper: createQueryWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useRequest', () => {
    it('should fetch a single request by ID', async () => {
      const { result } = renderHook(() => useRequest('request-123'), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.id).toBe('request-123')
      expect(result.current.data?.status).toBe('pending')
    })

    it('should not fetch when requestId is empty', () => {
      const { result } = renderHook(() => useRequest(''), {
        wrapper: createQueryWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useCreateRequest', () => {
    it('should create a new deletion request', async () => {
      const { result } = renderHook(() => useCreateRequest(), {
        wrapper: createQueryWrapper(),
      })

      act(() => {
        result.current.mutate('broker-123')
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.id).toBe('new-request-123')
    })
  })

  describe('useUpdateRequestStatus', () => {
    it('should update request status', async () => {
      const { result } = renderHook(() => useUpdateRequestStatus(), {
        wrapper: createQueryWrapper(),
      })

      act(() => {
        result.current.mutate({
          requestId: 'request-123',
          status: 'sent',
          notes: 'Email sent successfully',
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.status).toBe('sent')
    })
  })

  describe('useEmailPreview', () => {
    it('should fetch email preview for a request', async () => {
      const { result } = renderHook(() => useEmailPreview('request-123'), {
        wrapper: createQueryWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.subject).toContain('Data Deletion Request')
      expect(result.current.data?.to_email).toBe('privacy@testbroker.com')
    })
  })
})
