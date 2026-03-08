import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as authRepo from './auth.repo'
import { login, logout, refreshToken, register } from './auth.service'

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}))

vi.mock('./auth.repo', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  findUserById: vi.fn(),
  storeRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
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
      vi.mocked(authRepo.findUserByEmail).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed',
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

    it('should create user, generate tokens and return auth response', async () => {
      vi.mocked(authRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(authRepo.createUser).mockResolvedValue({
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

      expect(authRepo.findUserByEmail).toHaveBeenCalledWith('test@test.com')
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
      expect(authRepo.createUser).toHaveBeenCalledWith({
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
      expect(authRepo.storeRefreshToken).toHaveBeenCalledWith(1, 'refresh-token')

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
      vi.mocked(authRepo.findUserByEmail).mockResolvedValue(null)

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
      vi.mocked(authRepo.findUserByEmail).mockResolvedValue({
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
    })

    it('should return user and tokens when credentials are valid', async () => {
      vi.mocked(authRepo.findUserByEmail).mockResolvedValue({
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
      expect(authRepo.storeRefreshToken).toHaveBeenCalledWith(1, 'refresh-token')
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
      vi.mocked(authRepo.findRefreshToken).mockResolvedValue({
        userId: 1,
        refreshToken: 'old-token',
      })
      vi.mocked(authRepo.findUserById).mockResolvedValue(null)

      await expect(
        refreshToken({ refreshToken: 'old-token' }),
      ).rejects.toMatchObject({
        message: 'Invalid refresh token',
        statusCode: 401,
        errorType: 'Unauthorized',
      })
    })

    it('should revoke old token, store new one and return new tokens', async () => {
      vi.mocked(authRepo.findRefreshToken).mockResolvedValue({
        userId: 1,
        refreshToken: 'old-token',
      })
      vi.mocked(authRepo.findUserById).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
      vi.mocked(jwt.sign)
        .mockReturnValueOnce('new-access-token' as never)
        .mockReturnValueOnce('new-refresh-token' as never)

      const result = await refreshToken({ refreshToken: 'old-token' })

      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith('old-token')
      expect(authRepo.storeRefreshToken).toHaveBeenCalledWith(1, 'new-refresh-token')
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

      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith('refresh-token')
    })
  })

  describe('generateTokens config', () => {
    it('should throw internal server error if JWT secrets are missing during register', async () => {
      delete process.env.JWT_ACCESS_SECRET
      delete process.env.JWT_REFRESH_SECRET

      vi.mocked(authRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
      vi.mocked(authRepo.createUser).mockResolvedValue({
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