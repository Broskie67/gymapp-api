import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { errorHandler } from './error-handler'
import { AppError } from './errors'

describe('errorHandler', () => {
  let req: any
  let res: any
  let next: any
  let consoleErrorSpy: any

  beforeEach(() => {
    req = {
      originalUrl: '/auth/login',
    }

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    next = vi.fn()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy.mockRestore()
  })

  it('should return formatted response for AppError', () => {
    const error = new AppError(401, 'Unauthorized', 'Invalid credentials')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        path: '/auth/login',
      }),
    )

    const jsonArg = vi.mocked(res.json).mock.calls[0][0]
    expect(typeof jsonArg.timestamp).toBe('string')
    expect(new Date(jsonArg.timestamp).toISOString()).toBe(jsonArg.timestamp)
  })

  it('should return 500 formatted response for unknown error', () => {
    const error = new Error('Unexpected failure')

    errorHandler(error, req, res, next)

    expect(console.error).toHaveBeenCalledWith(error)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        error: 'InternalServerError',
        message: 'Internal server error',
        path: '/auth/login',
      }),
    )

    const jsonArg = vi.mocked(res.json).mock.calls[0][0]
    expect(typeof jsonArg.timestamp).toBe('string')
    expect(new Date(jsonArg.timestamp).toISOString()).toBe(jsonArg.timestamp)
  })
})