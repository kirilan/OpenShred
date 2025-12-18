import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brokersApi } from '@/services/api'

export function useBrokers() {
  return useQuery({
    queryKey: ['brokers'],
    queryFn: brokersApi.list,
  })
}

export function useBroker(brokerId: string) {
  return useQuery({
    queryKey: ['broker', brokerId],
    queryFn: () => brokersApi.get(brokerId),
    enabled: !!brokerId,
  })
}

export function useSyncBrokers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: brokersApi.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] })
    },
  })
}

export function useCreateBroker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: brokersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] })
    },
  })
}
