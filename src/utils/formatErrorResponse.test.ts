import { describe, it, expect } from 'vitest'
import { formatErrorResponse, formatSuccessResponse } from './formatErrorResponse'

describe('formatErrorResponse', () => {
  it('should return a formatted error response', () => {
    const result = formatErrorResponse(
      400,
      'BadRequest',
      'Email is required',
      '/auth/register'
    )

    expect(result).toMatchObject({
      status: 400,
      error: 'BadRequest',
      message: 'Email is required',
      path: '/auth/register',
    })

    expect(result.timestamp).toBeDefined()
    expect(typeof result.timestamp).toBe('string')
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp)
  })
})

describe('formatSuccessResponse', () => {
  it('should return a formatted success response', () => {
    const data = { id: 1, username: 'nathan' }

    const result = formatSuccessResponse(
      200,
      'User fetched successfully',
      data,
      '/auth/me'
    )

    expect(result).toMatchObject({
      status: 200,
      message: 'User fetched successfully',
      data,
      path: '/auth/me',
    })

    expect(result.timestamp).toBeDefined()
    expect(typeof result.timestamp).toBe('string')
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp)
  })
})