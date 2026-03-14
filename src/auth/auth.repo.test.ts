import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDb } from '../db'
import {
  findUserByEmail,
  createUser,
  findUserById,
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from './auth.repo'

vi.mock('../db', () => ({
  getDb: vi.fn(),
}))

describe('auth.repo', () => {
  const queryMock = vi.fn()
  const inputMock = vi.fn()
  const requestMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    inputMock.mockReturnThis()
    requestMock.mockReturnValue({
      input: inputMock,
      query: queryMock,
    })

    vi.mocked(getDb).mockResolvedValue({
      request: requestMock,
    } as any)
  })

  describe('findUserByEmail', () => {
    it('should return null when no user is found', async () => {
      queryMock.mockResolvedValue({
        recordset: [],
      })

      const result = await findUserByEmail('test@test.com')

      expect(getDb).toHaveBeenCalled()
      expect(requestMock).toHaveBeenCalled()
      expect(inputMock).toHaveBeenCalledWith('email', expect.anything(), 'test@test.com')
      expect(queryMock).toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'nathan',
            email: 'test@test.com',
            password_hash: 'hashed-password',
          },
        ],
      })

      const result = await findUserByEmail('test@test.com')

      expect(result).toEqual({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
    })
  })

  describe('createUser', () => {
    it('should return the created user', async () => {
      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'nathan',
            email: 'test@test.com',
            passwordHash: 'hashed-password',
          },
        ],
      })

      const result = await createUser({
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })

      expect(inputMock).toHaveBeenCalledWith('username', expect.anything(), 'nathan')
      expect(inputMock).toHaveBeenCalledWith('email', expect.anything(), 'test@test.com')
      expect(inputMock).toHaveBeenCalledWith('passwordHash', expect.anything(), 'hashed-password')
      expect(queryMock).toHaveBeenCalled()
      expect(result).toEqual({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
    })
  })

  describe('findUserById', () => {
    it('should return null when no user is found', async () => {
      queryMock.mockResolvedValue({
        recordset: [],
      })

      const result = await findUserById(1)

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'nathan',
            email: 'test@test.com',
            passwordHash: 'hashed-password',
          },
        ],
      })

      const result = await findUserById(1)

      expect(result).toEqual({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
    })
  })

  describe('storeRefreshToken', () => {
    it('should execute the insert query', async () => {
      queryMock.mockResolvedValue({})

      await storeRefreshToken(1, 'refresh-token')

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(inputMock).toHaveBeenCalledWith('token', expect.anything(), 'refresh-token')
      expect(queryMock).toHaveBeenCalled()
    })
  })

  describe('findRefreshToken', () => {
    it('should return null when token is not found', async () => {
      queryMock.mockResolvedValue({
        recordset: [],
      })

      const result = await findRefreshToken('refresh-token')

      expect(inputMock).toHaveBeenCalledWith('refreshToken', expect.anything(), 'refresh-token')
      expect(result).toBeNull()
    })

    it('should return the refresh token when found', async () => {
      queryMock.mockResolvedValue({
        recordset: [
          {
            userId: 1,
            refreshToken: 'refresh-token',
          },
        ],
      })

      const result = await findRefreshToken('refresh-token')

      expect(result).toEqual({
        userId: 1,
        refreshToken: 'refresh-token',
      })
    })
  })

  describe('revokeRefreshToken', () => {
    it('should execute the update query', async () => {
      queryMock.mockResolvedValue({})

      await revokeRefreshToken('refresh-token')

      expect(inputMock).toHaveBeenCalledWith('refreshToken', expect.anything(), 'refresh-token')
      expect(queryMock).toHaveBeenCalled()
    })
  })
})
