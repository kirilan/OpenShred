import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/api'
import { useEffect } from 'react'

export function useAuthStatus() {
  const { token, setUser, clearAuth, setLoading, setToken } = useAuthStore()

  const query = useQuery({
    queryKey: ['authStatus', token],
    queryFn: () => authApi.getStatus(),
    enabled: !!token,
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      if (query.data.is_authenticated && query.data.user) {
        setUser(query.data.user)
        if (query.data.token) {
          setToken(query.data.token)
        }
      } else {
        clearAuth()
      }
    }
    if (query.isError) {
      clearAuth()
    }
    if (!token) {
      setLoading(false)
    }
  }, [query.data, query.isError, token, setUser, clearAuth, setLoading, setToken])

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
