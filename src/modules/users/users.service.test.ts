import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'
import * as userRepo from '../users/users.repo'
import { getProfile, updateProfile, updatePassword } from './users.service'

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

vi.mock('./users.repo', () => ({
  findUserById: vi.fn(),
  findUserByEmail: vi.fn(),
  findStoredUserById: vi.fn(),
  updateUserById: vi.fn(),
  updatePasswordById: vi.fn(),
}))

describe('users.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return the existing user when found', async () => {
      const profile = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(userRepo.findUserById).mockResolvedValue(profile)

      const result = await getProfile(1)

      expect(userRepo.findUserById).toHaveBeenCalledWith(1)
      expect(result).toEqual(profile)
    })

    it('should throw not found if user does not exist', async () => {
      vi.mocked(userRepo.findUserById).mockResolvedValue(null)

      await expect(getProfile(1)).rejects.toMatchObject({
        message: 'user not found',
        statusCode: 404,
        errorType: 'NotFound',
      })
    })
  })

  describe('updateProfile', () => {
    it('should throw not found if user does not exist', async () => {
      vi.mocked(userRepo.findUserById).mockResolvedValue(null)

      await expect(updateProfile(1, { username: 'new-name' })).rejects.toMatchObject({
        message: 'user not found',
        statusCode: 404,
        errorType: 'NotFound',
      })
    })

    it('should throw conflict if email is already used by another user', async () => {
      const profile = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(userRepo.findUserById).mockResolvedValue(profile)
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
        id: 2,
        username: 'other-user',
        email: 'newtest@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(
        updateProfile(1, { email: 'newtest@test.com' }),
      ).rejects.toMatchObject({
        message: 'Email already in use',
        statusCode: 409,
        errorType: 'Conflict',
      })
    })

    it('should allow updating when the email belongs to the same user', async () => {
      const profile = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

       const updatedProfile = {
        ...profile,
        email: 'newEmail@gmail.com'
      }

      vi.mocked(userRepo.findUserById).mockResolvedValue(profile)
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(profile)
      vi.mocked(userRepo.updateUserById).mockResolvedValue(updatedProfile)

      const result = await updateProfile(1, { 
        email: 'test@test.com', 
        username: 'new-name' 
      })

      expect(userRepo.findUserById).toHaveBeenCalledWith(1)
      expect(userRepo.findUserByEmail).toHaveBeenCalledWith('test@test.com')
      expect(userRepo.updateUserById).toHaveBeenCalledWith(1, {
        email: 'test@test.com',
        username: 'new-name',
      })
      expect(result).toEqual(updatedProfile)
    })

    it('should update the user profile when an email is provided', async () => {
      const profile = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedProfile = {
        ...profile,
        email: 'newEmail@gmail.com'
      }
      vi.mocked(userRepo.findUserById).mockResolvedValue(profile)
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(userRepo.updateUserById).mockResolvedValue(updatedProfile)

      const result = await updateProfile(1, { 
        email: 'newEmail@gmail.com' 
      })

      expect(userRepo.findUserById).toHaveBeenCalledWith(1)
      expect(userRepo.updateUserById).toHaveBeenCalledWith(1, { 
        email: 'newEmail@gmail.com' 
      })
      expect(result).toEqual(updatedProfile)
    })

    it('should update the user profile when a username is provided', async () => {
      const profile = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedProfile = {
        ...profile,
        username: 'new-name'
      }

      vi.mocked(userRepo.findUserById).mockResolvedValue(profile)
      vi.mocked(userRepo.updateUserById).mockResolvedValue(updatedProfile)

      const result = await updateProfile(1, { 
        username:'new-name' 
      })

      expect(userRepo.findUserById).toHaveBeenCalledWith(1)
      expect(userRepo.updateUserById).toHaveBeenCalledWith(1, { 
        username: 'new-name' 
      })
      expect(result).toEqual(updatedProfile)
    })

    it('should update the user profile when username and email are both provided', async () => {
      const profile = {
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedProfile = {
        ...profile,
        email: 'newEmail@gmail.com',
        username: 'new-name'
      }

      vi.mocked(userRepo.findUserById).mockResolvedValue(profile)
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(userRepo.updateUserById).mockResolvedValue(updatedProfile)

      const result = await updateProfile(1, {
        email: 'newEmail@gmail.com', 
        username:'new-name' 
      })

      expect(userRepo.findUserById).toHaveBeenCalledWith(1)
      expect(userRepo.updateUserById).toHaveBeenCalledWith(1, { 
        email: 'newEmail@gmail.com', 
        username:'new-name' 
      })
      expect(result).toEqual(updatedProfile)
    })
  })

  describe('updatePassword', () => {
    it('should throw not found if user does not exist', async () => {
      vi.mocked(userRepo.findStoredUserById).mockResolvedValue(null)

      await expect(
        updatePassword(1, {
          currentPassword: 'old-password',
          newPassword: 'new-password',
        }),
      ).rejects.toMatchObject({
        message: 'user not found',
        statusCode: 404,
        errorType: 'NotFound',
      })
    })

    it('should throw unauthorized if current password is invalid', async () => {
      vi.mocked(userRepo.findStoredUserById).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        updatePassword(1, {
          currentPassword: 'wrong-password',
          newPassword: 'new-password',
        }),
      ).rejects.toMatchObject({
        message: 'Invalid current password',
        statusCode: 401,
        errorType: 'Unauthorized',
      })
    })

    it('should update the password when current password is valid', async () => {
      vi.mocked(userRepo.findStoredUserById).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never)
      vi.mocked(userRepo.updatePasswordById).mockResolvedValue(true)

      await expect(
        updatePassword(1, {
          currentPassword: 'current-password',
          newPassword: 'new-password',
        })
      ).resolves.toBeUndefined()

      expect(bcrypt.compare).toHaveBeenCalledWith('current-password', 'hashed-password')
      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10)
      expect(userRepo.updatePasswordById).toHaveBeenCalledWith(1, 'new-hashed-password')
    })

    it('should throw bad request if new password matches current password', async () => {
      vi.mocked(userRepo.findStoredUserById).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
    
      await expect(
        updatePassword(1, {
          currentPassword: 'same-password',
          newPassword: 'same-password',
        }),
      ).rejects.toMatchObject({
        message: 'New password must be different from current password',
        statusCode: 400,
        errorType: 'BadRequest',
      })
    })

    it('should throw not found if password update fails', async () => {
      vi.mocked(userRepo.findStoredUserById).mockResolvedValue({
        id: 1,
        username: 'nathan',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      })
    
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never)
      vi.mocked(userRepo.updatePasswordById).mockResolvedValue(false)
    
      await expect(
        updatePassword(1, {
          currentPassword: 'current-password',
          newPassword: 'new-password',
        }),
      ).rejects.toMatchObject({
        message: 'user not found',
        statusCode: 404,
        errorType: 'NotFound',
      })
    })
  })
})