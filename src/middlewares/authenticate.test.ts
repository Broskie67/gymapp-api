import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authenticate } from './authenticate'

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}))

describe('authenticate middleware', () => {
  const res = {} as Response
  let next: NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    next = vi.fn()
  })

  it('should call next with unauthorized error if authorization header is missing', () => {
    const req = {
      headers: {},
    } as Request

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Missing or invalid authorization header',
      })
    )
  })

  it('should call next with unauthorized error if authorization header does not start with Bearer', () => {
    const req = {
      headers: {
        authorization: 'Basic token',
      },
    } as Request

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Missing or invalid authorization header',
      })
    )
  })

  it('should attach payload to req.user and call next if token is valid', () => {
    const payload = {
      userId: 1,
      email: 'test@test.com',
      type: 'access',
    }

    vi.mocked(jwt.verify).mockReturnValue(payload as never)

    const req = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    } as Request

    authenticate(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith(
      'valid-token',
      process.env.JWT_ACCESS_SECRET
    )
    expect(req.user).toEqual(payload)
    expect(next).toHaveBeenCalledWith()
  })

  it('should call next with unauthorized error if token is invalid or expired', () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid token')
    })

    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as Request

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid or expired access token',
      })
    )
  })
})
