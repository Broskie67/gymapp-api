import { notFound, unauthorized, conflict, badRequest } from '../../middlewares/errors';
import bcrypt from 'bcrypt'
import * as userRepo from './users.repo'
import { UserProfile, UpdatedUserDto, ChangePasswordDto } from "./users.types";

export async function getProfile(userId: number): Promise<UserProfile> {
  const existingUser = await userRepo.findUserById(userId)

  if (!existingUser) {
      throw notFound('user not found')
  }

  return existingUser
}

export async function updateProfile(userId: number, data: UpdatedUserDto ): Promise<UserProfile> {
  const existingUser = await userRepo.findUserById(userId)

  if (!existingUser) {
    throw notFound('user not found')
  }

  if (data.email) {
    const userWithSameEmail = await userRepo.findUserByEmail(data.email)

    if (userWithSameEmail && userWithSameEmail.id !== userId) {
      throw conflict('Email already in use')
    }
  }

  const updatedUser = await userRepo.updateUserById(userId, data)

  if (!updatedUser) {
    throw notFound('user not found')
  }

  return updatedUser
}

export async function updatePassword(userId: number, data: ChangePasswordDto): Promise<void> {
  const existingUser = await userRepo.findStoredUserById(userId)

  if (!existingUser) {
    throw notFound('user not found')
  }

  if (data.currentPassword === data.newPassword) {
    throw badRequest('New password must be different from current password')
  }

  const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, existingUser.passwordHash)

  if (!isCurrentPasswordValid) {
    throw unauthorized('Invalid current password')
  }

  const updatedPasswordHash = await bcrypt.hash(data.newPassword, 10)
  const updated = await userRepo.updatePasswordById(userId, updatedPasswordHash)
  
  if (!updated) {
    throw notFound('user not found')
  }
}