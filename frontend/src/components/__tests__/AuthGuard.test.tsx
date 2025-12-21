import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthGuard } from '../auth/AuthGuard'
import { useAuthStore } from '@/stores/authStore'

// Mock the useAuthStatus hook
const mockUseAuthStatus = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuthStatus: () => mockUseAuthStatus(),
  useLogin: () => ({ login: vi.fn() }),
}))

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('AuthGuard', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useAuthStore.getState().clearAuth()
    })
    // Default mock - not loading
    mockUseAuthStatus.mockReturnValue({ isLoading: false })
  })

  it('should show loading state while checking auth', () => {
    mockUseAuthStatus.mockReturnValue({ isLoading: true })

    renderWithRouter()

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    // Check for spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show loading when store is loading', () => {
    act(() => {
      useAuthStore.setState({ isLoading: true })
    })
    mockUseAuthStatus.mockReturnValue({ isLoading: false })

    renderWithRouter()

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show login page when not authenticated', () => {
    mockUseAuthStatus.mockReturnValue({ isLoading: false })
    act(() => {
      useAuthStore.setState({
        userId: null,
        isAuthenticated: false,
        isLoading: false,
      })
    })

    renderWithRouter()

    // LoginPage should be rendered
    expect(screen.getByText('OpenShred')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })

  it('should render protected content when authenticated', () => {
    mockUseAuthStatus.mockReturnValue({ isLoading: false })
    act(() => {
      useAuthStore.setState({
        userId: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true,
        isLoading: false,
      })
    })

    renderWithRouter()

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show login when userId is null but isAuthenticated is true', () => {
    mockUseAuthStatus.mockReturnValue({ isLoading: false })
    act(() => {
      useAuthStore.setState({
        userId: null,
        isAuthenticated: true,
        isLoading: false,
      })
    })

    renderWithRouter()

    // Should still show login because userId check fails
    expect(screen.getByText('OpenShred')).toBeInTheDocument()
  })

  it('should show login when isAuthenticated is false but userId exists', () => {
    mockUseAuthStatus.mockReturnValue({ isLoading: false })
    act(() => {
      useAuthStore.setState({
        userId: 'user-123',
        isAuthenticated: false,
        isLoading: false,
      })
    })

    renderWithRouter()

    // Should show login because isAuthenticated is false
    expect(screen.getByText('OpenShred')).toBeInTheDocument()
  })
})
