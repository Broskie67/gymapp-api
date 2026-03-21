import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as authRepo from './auth.repo'
import * as userRepo from '../users/users.repo'
import { login, logout, refreshToken, register } from './auth.service'
import { hashToken } from '../../utils/tokenHash'

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}))

vi.mock('./auth.repo', () => ({
  storeRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
  revokeAllRefreshTokensByUserId: vi.fn(),
  deleteRevokedOrExpiredRefreshTokensByUserId: vi.fn(),
}))

vi.mock('../users/users.repo', () => ({
  findUserById: vi.fn(),
  findUserByEmail: vi.fn(),
  findStoredUserByEmail: vi.fn(),
  findStoredUserById: vi.fn(),
  createUser: vi.fn(),
}))

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_ACCESS_SECRET = 'access-secret'
    process.env.JWT_REFRESH_SECRET = 'refresh-secret'
  })

  afterEach(() => {
    delete process.env.JWT_ACCESS_SECRET
    delete process.env.JWT_REFRESH_SECRET
  })

  describe('register', () => {
    it('should throw conflict if email is already in use', async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(
        register({
          username: 'nathan',
          email: 'test@test.com',
          password: '123456',
        }),
      ).rejects.toMatchObject({
        message: 'Email already in use',
        statusCode: 409,
        errorType: 'Conflict',
      })
    })

    it('should create user, revoke previous tokens, generate tokens and return auth response', async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(userRepo.createUser).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
      vi.mocked(jwt.sign)
        .mockReturnValueOnce('access-token' as never)
        .mockReturnValueOnce('refresh-token' as never)

      const result = await register({
        username: 'nathan',
        email: 'test@test.com',
        password: '123456',
      })

      expect(userRepo.findUserByEmail).toHaveBeenCalledWith('test@test.com')
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
      expect(userRepo.createUser).toHaveBeenCalledWith({
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
      expect(authRepo.storeRefreshToken).toHaveBeenCalledWith(1,  hashToken('refresh-token'))

      expect(result).toEqual({
        user: {
          id: 1,
          username: 'nathan',
          email: 'test@test.com',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      })
    })
  })

  describe('login', () => {
    it('should throw unauthorized if user does not exist', async () => {
      vi.mocked(userRepo.findStoredUserByEmail).mockResolvedValue(null)

      await expect(
        login({
          email: 'test@test.com',
          password: '123456',
        }),
      ).rejects.toMatchObject({
        message: 'Invalid credentials',
        statusCode: 401,
        errorType: 'Unauthorized',
      })
    })

    it('should throw unauthorized if password is invalid', async () => {
      vi.mocked(userRepo.findStoredUserByEmail).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        login({
          email: 'test@test.com',
          password: '123456',
        }),
      ).rejects.toMatchObject({
        message: 'Invalid credentials',
        statusCode: 401,
        errorType: 'Unauthorized',
      })

      expect(authRepo.deleteRevokedOrExpiredRefreshTokensByUserId).not.toHaveBeenCalled()
      expect(authRepo.revokeAllRefreshTokensByUserId).not.toHaveBeenCalled()
      expect(authRepo.storeRefreshToken).not.toHaveBeenCalled()
    })

    it('should clean old tokens, revoke active ones, store a new refresh token and return user and tokens when credentials are valid', async () => {
      vi.mocked(userRepo.findStoredUserByEmail).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(jwt.sign)
        .mockReturnValueOnce('access-token' as never)
        .mockReturnValueOnce('refresh-token' as never)

      const result = await login({
        email: 'test@test.com',
        password: '123456',
      })

      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-password')
      expect(authRepo.deleteRevokedOrExpiredRefreshTokensByUserId).toHaveBeenCalledWith(1)
      expect(authRepo.revokeAllRefreshTokensByUserId).toHaveBeenCalledWith(1)
      expect(authRepo.storeRefreshToken).toHaveBeenCalledWith(1, hashToken('refresh-token'))
      expect(result).toEqual({
        user: {
          id: 1,
          username: 'nathan',
          email: 'test@test.com',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      })
    })
  })

  describe('refreshToken', () => {
    it('should throw unauthorized if refresh token does not exist', async () => {
      vi.mocked(jwt.verify).mockReturnValue({
        userId: 1,
        email: 'test@test.com',
      } as never)

      vi.mocked(authRepo.findRefreshToken).mockResolvedValue(null)

      await expect(
        refreshToken({ refreshToken: 'old-token' }),
        ).rejects.toMatchObject({
            message: 'Invalid refresh token',
            statusCode: 401,
            errorType: 'Unauthorized',
        })
      })

    it('should throw unauthorized if linked user does not exist', async () => {
      vi.mocked(jwt.verify).mockReturnValue({
        userId: 1,
        email: 'test@test.com',
      } as never)
          
      vi.mocked(authRepo.findRefreshToken).mockResolvedValue({
        userId: 1,
        tokenHash: hashToken('old-token'),
      } as never)
      vi.mocked(userRepo.findUserById).mockResolvedValue(null)

      await expect(
        refreshToken({ refreshToken: 'old-token' }),
      ).rejects.toMatchObject({
        message: 'Invalid refresh token',
        statusCode: 401,
        errorType: 'Unauthorized',
      })
    })

    it('should revoke old token, store new one and return new tokens', async () => {
      vi.mocked(jwt.verify).mockReturnValue({
        userId: 1,
        email: 'test@test.com',
        type: 'refresh',
      } as never)

      vi.mocked(authRepo.findRefreshToken).mockResolvedValue({
        userId: 1,
        tokenHash: hashToken('old-token'),
      } as never)

      vi.mocked(userRepo.findUserById).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(jwt.sign)
        .mockReturnValueOnce('new-access-token' as never)
        .mockReturnValueOnce('new-refresh-token' as never)

      const result = await refreshToken({ refreshToken: 'old-token' })

      expect(jwt.verify).toHaveBeenCalledWith(
        'old-token',
        process.env.JWT_REFRESH_SECRET
      )
      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(hashToken('old-token'))
      expect(authRepo.storeRefreshToken).toHaveBeenCalledWith(1, hashToken('new-refresh-token'))
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })
    })
  })

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      vi.mocked(authRepo.revokeRefreshToken).mockResolvedValue(undefined)

      await logout('refresh-token')

      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(hashToken('refresh-token') )
    })
  })

  describe('generateTokens config', () => {
    it('should throw internal server error if JWT secrets are missing during register', async () => {
      delete process.env.JWT_ACCESS_SECRET
      delete process.env.JWT_REFRESH_SECRET

      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(userRepo.createUser).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })

      await expect(
        register({
          username: 'nathan',
          email: 'test@test.com',
          password: '123456',
        }),
      ).rejects.toMatchObject({
        message: 'JWT secrets are not configured',
        statusCode: 500,
        errorType: 'InternalServerError',
      })
    })
  })
})
