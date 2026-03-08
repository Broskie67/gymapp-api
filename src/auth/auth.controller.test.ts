import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register, login, refreshToken, logout } from './auth.controller'
import * as authService from './auth.service'

vi.mock('./auth.service')

describe('auth.controller', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { body: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should return 201 with result', async () => {
      const mockResult = { user: { id: 1 }, tokens: { accessToken: 'a', refreshToken: 'b' } }
      req.body = { username: 'test', email: 'test@test.com', password: '123456' }
      vi.mocked(authService.register).mockResolvedValue(mockResult as any)

      await register(req, res, next)

      expect(authService.register).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })

    it('should call next on error', async () => {
      const error = new Error('register error')
      vi.mocked(authService.register).mockRejectedValue(error)

      await register(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('login', () => {
    it('should return 200 with result', async () => {
      const mockResult = { user: { id: 1 }, tokens: { accessToken: 'a', refreshToken: 'b' } }
      req.body = { email: 'test@test.com', password: '123456' }
      vi.mocked(authService.login).mockResolvedValue(mockResult as any)

      await login(req, res, next)

      expect(authService.login).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })

    it('should call next on error', async () => {
      const error = new Error('login error')
      vi.mocked(authService.login).mockRejectedValue(error)

      await login(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('refreshToken', () => {
    it('should return 200 with tokens', async () => {
      const mockResult = { accessToken: 'newA', refreshToken: 'newB' }
      req.body = { refreshToken: 'oldToken' }
      vi.mocked(authService.refreshToken).mockResolvedValue(mockResult as any)

      await refreshToken(req, res, next)

      expect(authService.refreshToken).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })

    it('should call next on error', async () => {
      const error = new Error('refresh error')
      vi.mocked(authService.refreshToken).mockRejectedValue(error)

      await refreshToken(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('logout', () => {
    it('should return 200 with success message', async () => {
      req.body = { refreshToken: 'token123' }
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      await logout(req, res, next)

      expect(authService.logout).toHaveBeenCalledWith('token123')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' })
    })

    it('should call next on error', async () => {
      const error = new Error('logout error')
      vi.mocked(authService.logout).mockRejectedValue(error)

      await logout(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})