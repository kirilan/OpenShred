import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAuthStatus } from '@/hooks/useAuth'
import { LoginPage } from './LoginPage'

export function AuthGuard() {
  const { userId, isAuthenticated, isLoading } = useAuthStore()
  const { isLoading: isCheckingAuth } = useAuthStatus()

  // Show loading state while checking auth
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!userId || !isAuthenticated) {
    return <LoginPage />
  }

  return <Outlet />
}
