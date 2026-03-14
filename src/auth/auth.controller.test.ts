import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register, login, refreshToken, logout } from './auth.controller'
import * as authService from './auth.service'

vi.mock('./auth.service', () => ({
  register: vi.fn(),
  login: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn(),
}))

describe('auth.controller', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: '/auth/test',
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should return 201 with formatted success response', async () => {
      const mockResult = {
        user: { id: 1 },
        tokens: { accessToken: 'a', refreshToken: 'b' },
      }

      req.body = { username: 'test', email: 'test@test.com', password: '123456' }
      req.originalUrl = '/auth/register'

      vi.mocked(authService.register).mockResolvedValue(mockResult as any)

      await register(req, res, next)

      expect(authService.register).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 201,
          message: 'User registered successfully',
          data: mockResult,
          path: '/auth/register',
        }),
      )

      const jsonArg = vi.mocked(res.json).mock.calls[0][0]
      expect(typeof jsonArg.timestamp).toBe('string')
    })

    it('should call next on error', async () => {
      const error = new Error('register error')
      vi.mocked(authService.register).mockRejectedValue(error)

      await register(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('login', () => {
    it('should return 200 with formatted success response', async () => {
      const mockResult = {
        user: { id: 1 },
        tokens: { accessToken: 'a', refreshToken: 'b' },
      }

      req.body = { email: 'test@test.com', password: '123456' }
      req.originalUrl = '/auth/login'

      vi.mocked(authService.login).mockResolvedValue(mockResult as any)

      await login(req, res, next)

      expect(authService.login).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Login successful',
          data: mockResult,
          path: '/auth/login',
        }),
      )

      const jsonArg = vi.mocked(res.json).mock.calls[0][0]
      expect(typeof jsonArg.timestamp).toBe('string')
    })

    it('should call next on error', async () => {
      const error = new Error('login error')
      vi.mocked(authService.login).mockRejectedValue(error)

      await login(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('refreshToken', () => {
    it('should return 200 with formatted success response', async () => {
      const mockResult = { accessToken: 'newA', refreshToken: 'newB' }

      req.body = { refreshToken: 'oldToken' }
      req.originalUrl = '/auth/refresh-token'

      vi.mocked(authService.refreshToken).mockResolvedValue(mockResult as any)

      await refreshToken(req, res, next)

      expect(authService.refreshToken).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Token refreshed successfully',
          data: mockResult,
          path: '/auth/refresh-token',
        }),
      )

      const jsonArg = vi.mocked(res.json).mock.calls[0][0]
      expect(typeof jsonArg.timestamp).toBe('string')
    })

    it('should call next on error', async () => {
      const error = new Error('refresh error')
      vi.mocked(authService.refreshToken).mockRejectedValue(error)

      await refreshToken(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('logout', () => {
    it('should return 200 with formatted success response', async () => {
      req.body = { refreshToken: 'token123' }
      req.originalUrl = '/auth/logout'

      vi.mocked(authService.logout).mockResolvedValue(undefined)

      await logout(req, res, next)

      expect(authService.logout).toHaveBeenCalledWith('token123')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Logged out successfully',
          data: null,
          path: '/auth/logout',
        }),
      )

      const jsonArg = vi.mocked(res.json).mock.calls[0][0]
      expect(typeof jsonArg.timestamp).toBe('string')
    })

    it('should call next on error', async () => {
      const error = new Error('logout error')
      vi.mocked(authService.logout).mockRejectedValue(error)

      await logout(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})