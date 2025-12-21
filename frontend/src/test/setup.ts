import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Suppress expected React error boundary errors in tests
// These are thrown intentionally by ErrorBoundary tests and pollute the output
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  const message = args.join(' ')
  // Suppress expected error boundary errors
  if (
    message.includes('The above error occurred') ||
    message.includes('Test error message') ||
    message.includes('ThrowError') ||
    message.includes('Consider adding an error boundary') ||
    message.includes('ErrorBoundary')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

// Also handle the window error events from jsdom for error boundary tests
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('Test error message') ||
      event.filename?.includes('ErrorBoundary.test')
    ) {
      event.preventDefault()
    }
  })
}

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any request handlers that are declared during tests
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after all tests are done
afterAll(() => server.close())

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
