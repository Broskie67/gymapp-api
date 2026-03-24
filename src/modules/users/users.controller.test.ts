import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProfile, updateProfile, updatePassword } from './users.controller'
import * as userService from './users.service'

vi.mock('./users.service', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
}))

describe('users.controller', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: '/users/test',
      user: { userId: 1, email: 'test@test.com' },
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return 200 with formatted success response', async () => {
      const mockResult = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      req.originalUrl = '/users/me'
      vi.mocked(userService.getProfile).mockResolvedValue(mockResult as any)

      await getProfile(req, res, next)

      expect(userService.getProfile).toHaveBeenCalledWith(1)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Profile retrieved successfully',
          data: mockResult,
          path: '/users/me',
        }),
      )

      const jsonArg = vi.mocked(res.json).mock.calls[0][0]
      expect(typeof jsonArg.timestamp).toBe('string')
    })

    it('should call next on error', async () => {
      const error = new Error('get profile error')
      vi.mocked(userService.getProfile).mockRejectedValue(error)

      await getProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('updateProfile', () => {
    it('should return 200 with formatted success response', async () => {
      const mockResult = {
        id: 1,
        username: 'new-name',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      req.body = { username: 'new-name' }
      req.originalUrl = '/users/me'
      vi.mocked(userService.updateProfile).mockResolvedValue(mockResult as any)

      await updateProfile(req, res, next)

      expect(userService.updateProfile).toHaveBeenCalledWith(1, req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Profile updated successfully',
          data: mockResult,
          path: '/users/me',
        }),
      )

      const jsonArg = vi.mocked(res.json).mock.calls[0][0]
      expect(typeof jsonArg.timestamp).toBe('string')
    })

    it('should call next on error', async () => {
      const error = new Error('update profile error')
      vi.mocked(userService.updateProfile).mockRejectedValue(error)

      await updateProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('updatePassword', () => {
    it('should return 200 with formatted success response', async () => {
      req.body = {
        currentPassword: 'old-password',
        newPassword: 'new-password',
      }
      req.originalUrl = '/users/me/password'

      vi.mocked(userService.updatePassword).mockResolvedValue(undefined)

      await updatePassword(req, res, next)

      expect(userService.updatePassword).toHaveBeenCalledWith(1, req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Password updated successfully',
          data: null,
          path: '/users/me/password',
        }),
      )

      const jsonArg = vi.mocked(res.json).mock.calls[0][0]
      expect(typeof jsonArg.timestamp).toBe('string')
    })

    it('should call next on error', async () => {
      const error = new Error('update password error')
      vi.mocked(userService.updatePassword).mockRejectedValue(error)

      await updatePassword(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
