import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDb } from '../../db'
import { findUserById, findStoredUserById, findUserByEmail, findStoredUserByEmail, createUser, updateUserById, updatePasswordById } from '../users/users.repo'

vi.mock('../../db', () => ({
  getDb: vi.fn(),
}))

describe('user.repo', () => {
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
      const createdAt = new Date()
      const updatedAt = new Date()

      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'nathan',
            email: 'test@test.com',
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ],
      })

      const result = await findUserByEmail('test@test.com')

      expect(result).toEqual({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt,
        updatedAt,
      })
    })
  })

  describe('findStoredUserByEmail', () => {
    it('should return null when no user is found', async () => {
      queryMock.mockResolvedValue({
        recordset: [],
      })

      const result = await findStoredUserByEmail('test@test.com')

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

      const result = await findStoredUserByEmail('test@test.com')

      expect(result).toEqual({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
    })
  })

  describe('findStoredUserById', () => {
    it('should return null when no user is found', async () => {
      queryMock.mockResolvedValue({
        recordset: [],
      })
  
      const result = await findStoredUserById(1)
  
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
            password_hash: 'hashed-password',
          },
        ],
      })

      const result = await findStoredUserById(1)

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
        recordset: []
      })

      const result = await findUserById(1)

      expect(getDb).toHaveBeenCalled()
      expect(requestMock).toHaveBeenCalled()
      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(queryMock).toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return the user when found', async () => {
      const createdAt = new Date()
      const updatedAt = new Date()

      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'nathan',
            email: 'test@test.com',
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ],
      })
  
      const result = await findUserById(1)
  
      expect(result).toEqual({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt,
        updatedAt
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

  describe('updateUserById', () => {
    it('should return null when no user is found', async () => {
       queryMock.mockResolvedValue({
        recordset: []
      })

      const result = await updateUserById(1, { username: 'new-name' })

      expect(getDb).toHaveBeenCalled()
      expect(requestMock).toHaveBeenCalled()
      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(queryMock).toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should update username when provided', async () => {
      const createdAt = new Date()
      const updatedAt = new Date()

      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'new-name',
            email: 'test@test.com',
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ],
      })

      const result = await updateUserById(1, {
        username: 'new-name',
      })

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(inputMock).toHaveBeenCalledWith('username', expect.anything(), 'new-name')
      expect(inputMock).toHaveBeenCalledWith('email', expect.anything(), null)
      expect(queryMock).toHaveBeenCalled()

      expect(result).toEqual({
        id: 1,
        username: 'new-name',
        email: 'test@test.com',
        createdAt,
        updatedAt,
      })
    })

    it('should update email when provided', async () => {
      const createdAt = new Date()
      const updatedAt = new Date()

      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'username',
            email: 'newtest@test.com',
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ],
      })

      const result = await updateUserById(1, {
        email: 'newtest@test.com',
      })

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(inputMock).toHaveBeenCalledWith('username', expect.anything(), null)
      expect(inputMock).toHaveBeenCalledWith('email', expect.anything(), 'newtest@test.com')
      expect(queryMock).toHaveBeenCalled()

      expect(result).toEqual({
        id: 1,
        username: 'username',
        email: 'newtest@test.com',
        createdAt,
        updatedAt,
      })
    })

    it('should update both username and email when provided', async () => {
      const createdAt = new Date()
      const updatedAt = new Date()

      queryMock.mockResolvedValue({
        recordset: [
          {
            id: 1,
            username: 'new-name',
            email: 'newtest@test.com',
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ],
      })

      const result = await updateUserById(1, {
        username: 'new-name',
        email: 'newtest@test.com',
      })

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(inputMock).toHaveBeenCalledWith('username', expect.anything(), 'new-name')
      expect(inputMock).toHaveBeenCalledWith('email', expect.anything(), 'newtest@test.com')
      expect(queryMock).toHaveBeenCalled()

      expect(result).toEqual({
        id: 1,
        username: 'new-name',
        email: 'newtest@test.com',
        createdAt,
        updatedAt,
      })

    })
  })

  describe('updatePasswordById', () => {
    it('should return false when no user is updated', async () => {
      queryMock.mockResolvedValue({
        rowsAffected: [0],
      })

      const result = await updatePasswordById(1, 'new-hashed-password')

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(inputMock).toHaveBeenCalledWith('passwordHash', expect.anything(), 'new-hashed-password')
      expect(queryMock).toHaveBeenCalled()
      expect(result).toBe(false)

    })

    it('should return true when password is updated', async () => {
      queryMock.mockResolvedValue({
        rowsAffected: [1],
      })

      const result = await updatePasswordById(1, 'new-hashed-password')

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(inputMock).toHaveBeenCalledWith('passwordHash', expect.anything(), 'new-hashed-password')
      expect(queryMock).toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })
})

