import { describe, it, expect, vi, beforeEach } from 'vitest'
import sql from 'mssql'
import {
  findUserByEmail,
  createUser,
  findUserById,
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from './auth.repo'

vi.mock('mssql', () => ({
  default: {
    query: vi.fn(),
  },
}))

describe('auth.repo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findUserByEmail', () => {
    it('should return null when no user is found', async () => {
      vi.mocked(sql.query).mockResolvedValue({
        recordset: [],
      } as any)

      const result = await findUserByEmail('test@test.com')

      expect(sql.query).toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      }

      vi.mocked(sql.query).mockResolvedValue({
        recordset: [mockUser],
      } as any)

      const result = await findUserByEmail('test@test.com')

      expect(sql.query).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('createUser', () => {
    it('should return the created user', async () => {
      const mockUser = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      }

      vi.mocked(sql.query).mockResolvedValue({
        recordset: [mockUser],
      } as any)

      const result = await createUser({
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })

      expect(sql.query).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('findUserById', () => {
    it('should return null when no user is found', async () => {
      vi.mocked(sql.query).mockResolvedValue({
        recordset: [],
      } as any)

      const result = await findUserById(1)

      expect(sql.query).toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      }

      vi.mocked(sql.query).mockResolvedValue({
        recordset: [mockUser],
      } as any)

      const result = await findUserById(1)

      expect(sql.query).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('storeRefreshToken', () => {
    it('should execute the insert query', async () => {
      vi.mocked(sql.query).mockResolvedValue({} as any)

      await storeRefreshToken(1, 'refresh-token')

      expect(sql.query).toHaveBeenCalled()
    })
  })

  describe('findRefreshToken', () => {
    it('should return null when token is not found', async () => {
      vi.mocked(sql.query).mockResolvedValue({
        recordset: [],
      } as any)

      const result = await findRefreshToken('refresh-token')

      expect(sql.query).toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return the refresh token when found', async () => {
      const mockToken = {
        userId: 1,
        refreshToken: 'refresh-token',
      }

      vi.mocked(sql.query).mockResolvedValue({
        recordset: [mockToken],
      } as any)

      const result = await findRefreshToken('refresh-token')

      expect(sql.query).toHaveBeenCalled()
      expect(result).toEqual(mockToken)
    })
  })

  describe('revokeRefreshToken', () => {
    it('should execute the delete query', async () => {
      vi.mocked(sql.query).mockResolvedValue({} as any)

      await revokeRefreshToken('refresh-token')

      expect(sql.query).toHaveBeenCalled()
    })
  })
})