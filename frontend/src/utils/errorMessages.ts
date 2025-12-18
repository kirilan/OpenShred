/**
 * Extract a user-friendly error message from various error types
 */
export function getErrorMessage(error: any): string {
  // Handle axios/fetch errors with response data
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }

  // Handle validation errors
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: any): boolean {
  return (
    error.message === 'Network Error' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    !error.response
  )
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error.response?.status === 401 || error.response?.status === 403
}

/**
 * Get a user-friendly message for common HTTP status codes
 */
export function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.'
    case 401:
      return 'You are not authenticated. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'This action conflicts with existing data.'
    case 422:
      return 'Invalid data provided. Please check your input.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'Server error. Please try again later.'
    case 502:
      return 'Service unavailable. Please try again later.'
    case 503:
      return 'Service temporarily unavailable. Please try again later.'
    default:
      return 'An error occurred. Please try again.'
  }
}
