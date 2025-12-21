import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RateLimitNotice } from '../layout/RateLimitNotice'
import { useRateLimitStore } from '@/stores/rateLimitStore'

describe('RateLimitNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset store before each test
    act(() => {
      useRateLimitStore.getState().clearNotice()
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render nothing when there is no notice', () => {
    const { container } = render(<RateLimitNotice />)
    expect(container.firstChild).toBeNull()
  })

  it('should render notice when rate limit is set', () => {
    act(() => {
      useRateLimitStore.getState().setNotice({
        message: 'Too many requests',
        retryAfter: 60,
        triggeredAt: Date.now(),
      })
    })

    render(<RateLimitNotice />)

    expect(screen.getByText('Requests temporarily throttled')).toBeInTheDocument()
    expect(screen.getByText('Too many requests')).toBeInTheDocument()
  })

  it('should display countdown timer', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    act(() => {
      useRateLimitStore.getState().setNotice({
        message: 'Rate limited',
        retryAfter: 90,
        triggeredAt: now,
      })
    })

    render(<RateLimitNotice />)

    // Should show 1m 30s initially
    expect(screen.getByText(/try again in 1m 30s/i)).toBeInTheDocument()
  })

  it('should update countdown every second', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    act(() => {
      useRateLimitStore.getState().setNotice({
        message: 'Rate limited',
        retryAfter: 65,
        triggeredAt: now,
      })
    })

    render(<RateLimitNotice />)

    expect(screen.getByText(/try again in 1m 5s/i)).toBeInTheDocument()

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
      vi.setSystemTime(now + 5000)
    })

    expect(screen.getByText(/try again in 1m/i)).toBeInTheDocument()
  })

  it('should format time in seconds when less than a minute', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    act(() => {
      useRateLimitStore.getState().setNotice({
        message: 'Rate limited',
        retryAfter: 45,
        triggeredAt: now,
      })
    })

    render(<RateLimitNotice />)

    expect(screen.getByText(/try again in 45s/i)).toBeInTheDocument()
  })

  it('should show "now" when countdown reaches zero', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    act(() => {
      useRateLimitStore.getState().setNotice({
        message: 'Rate limited',
        retryAfter: 1,
        triggeredAt: now,
      })
    })

    render(<RateLimitNotice />)

    // Advance past retry time
    act(() => {
      vi.advanceTimersByTime(2000)
      vi.setSystemTime(now + 2000)
    })

    expect(screen.getByText(/try again in now/i)).toBeInTheDocument()
  })

  it('should clear notice when dismiss button is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()

    act(() => {
      useRateLimitStore.getState().setNotice({
        message: 'Rate limited',
        retryAfter: 60,
        triggeredAt: Date.now(),
      })
    })

    const { rerender } = render(<RateLimitNotice />)

    expect(screen.getByText('Requests temporarily throttled')).toBeInTheDocument()

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    await user.click(dismissButton)

    // Rerender to reflect store update
    rerender(<RateLimitNotice />)

    expect(screen.queryByText('Requests temporarily throttled')).not.toBeInTheDocument()
  })

  it('should not show retry time when retryAfter is 0', () => {
    act(() => {
      useRateLimitStore.getState().setNotice({
        message: 'Rate limited',
        retryAfter: 0,
        triggeredAt: Date.now(),
      })
    })

    render(<RateLimitNotice />)

    expect(screen.getByText('Requests temporarily throttled')).toBeInTheDocument()
    expect(screen.queryByText(/try again in/i)).not.toBeInTheDocument()
  })
})
