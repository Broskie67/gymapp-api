import { describe, it, expect, vi, beforeEach } from 'vitest'
import { query } from '../../db'
import {
  findUserById,
  findStoredUserById,
  findUserByEmail,
  findStoredUserByEmail,
  createUser,
  updateUserById,
  updatePasswordById,
} from '../users/users.repo'

vi.mock('../../db', () => ({
  query: vi.fn(),
}))

const mockQuery = vi.mocked(query)

describe('users.repo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery.mockResolvedValue([])
  })

  describe('findUserByEmail', () => {
    it('should return null when no user is found', async () => {
      const result = await findUserByEmail('test@test.com')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        ['test@test.com']
      )
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      const user = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockQuery.mockResolvedValue([user])

      const result = await findUserByEmail('test@test.com')

      expect(result).toEqual(user)
    })
  })

  describe('findStoredUserByEmail', () => {
    it('should return null when no user is found', async () => {
      const result = await findStoredUserByEmail('test@test.com')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        ['test@test.com']
      )
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      const user = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      }
      mockQuery.mockResolvedValue([user])

      const result = await findStoredUserByEmail('test@test.com')

      expect(result).toEqual(user)
    })
  })

  describe('findStoredUserById', () => {
    it('should return null when no user is found', async () => {
      const result = await findStoredUserById(1)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [1]
      )
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      const user = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      }
      mockQuery.mockResolvedValue([user])

      const result = await findStoredUserById(1)

      expect(result).toEqual(user)
    })
  })

  describe('findUserById', () => {
    it('should return null when no user is found', async () => {
      const result = await findUserById(1)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [1]
      )
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      const user = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockQuery.mockResolvedValue([user])

      const result = await findUserById(1)

      expect(result).toEqual(user)
    })
  })

  describe('createUser', () => {
    it('should insert the user and return it', async () => {
      const user = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      }
      mockQuery.mockResolvedValue([user])

      const result = await createUser({
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('RETURNING'),
        ['nathan', 'test@test.com', 'hashed-password']
      )
      expect(result).toEqual(user)
    })
  })

  describe('updateUserById', () => {
    it('should return null when no user is found', async () => {
      const result = await updateUserById(1, { username: 'new-name' })

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 'new-name', null])
      expect(result).toBeNull()
    })

    it('should update username when provided', async () => {
      const user = {
        id: 1,
        username: 'new-name',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockQuery.mockResolvedValue([user])

      const result = await updateUserById(1, { username: 'new-name' })

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 'new-name', null])
      expect(result).toEqual(user)
    })

    it('should update email when provided', async () => {
      const user = {
        id: 1,
        username: 'username',
        email: 'newtest@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockQuery.mockResolvedValue([user])

      const result = await updateUserById(1, { email: 'newtest@test.com' })

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, null, 'newtest@test.com'])
      expect(result).toEqual(user)
    })

    it('should update both username and email when provided', async () => {
      const user = {
        id: 1,
        username: 'new-name',
        email: 'newtest@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockQuery.mockResolvedValue([user])

      const result = await updateUserById(1, {
        username: 'new-name',
        email: 'newtest@test.com',
      })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [1, 'new-name', 'newtest@test.com']
      )
      expect(result).toEqual(user)
    })
  })

  describe('updatePasswordById', () => {
    it('should return false when no user is updated', async () => {
      const result = await updatePasswordById(1, 'new-hashed-password')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('password_hash = $2'),
        [1, 'new-hashed-password']
      )
      expect(result).toBe(false)
    })

    it('should return true when password is updated', async () => {
      mockQuery.mockResolvedValue([{ id: 1 }])

      const result = await updatePasswordById(1, 'new-hashed-password')

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 'new-hashed-password'])
      expect(result).toBe(true)
    })
  })
})

