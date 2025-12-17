import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/api'
import { useEffect } from 'react'

export function useAuthStatus() {
  const { userId, setUser, clearAuth, setLoading } = useAuthStore()

  const query = useQuery({
    queryKey: ['authStatus', userId],
    queryFn: () => authApi.getStatus(userId!),
    enabled: !!userId,
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      if (query.data.is_authenticated && query.data.user) {
        setUser(userId!, query.data.user)
      } else {
        clearAuth()
      }
    }
    if (query.isError) {
      clearAuth()
    }
    if (!userId) {
      setLoading(false)
    }
  }, [query.data, query.isError, userId, setUser, clearAuth, setLoading])

  return query
}

export function useLogin() {
  const login = async () => {
    const data = await authApi.login()
    // Store the state for validation after redirect
    sessionStorage.setItem('oauth_state', data.state)
    // Redirect to Google
    window.location.href = data.authorization_url
  }

  return { login }
}

export function useLogout() {
  const { clearAuth } = useAuthStore()

  const logout = () => {
    clearAuth()
    sessionStorage.removeItem('oauth_state')
  }

  return { logout }
}
