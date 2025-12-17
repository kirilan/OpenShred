import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { responsesApi } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import type { BrokerResponse } from '@/types'

export function useResponses(requestId?: string) {
  const { userId } = useAuthStore()

  return useQuery<BrokerResponse[]>({
    queryKey: ['responses', userId, requestId],
    queryFn: () => responsesApi.list(userId!, requestId),
    enabled: !!userId,
  })
}

export function useResponse(responseId: string) {
  return useQuery<BrokerResponse>({
    queryKey: ['response', responseId],
    queryFn: () => responsesApi.get(responseId),
    enabled: !!responseId,
  })
}

export function useScanResponses() {
  const { userId } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (daysBack: number = 7) => responsesApi.scanResponses(userId!, daysBack),
    onSuccess: () => {
      // Invalidate and refetch responses after scan
      queryClient.invalidateQueries({ queryKey: ['responses'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}
