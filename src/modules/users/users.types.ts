export type UserProfile = {
  id: number
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type StoredUser = {
  id: number
  email: string
  username: string
  passwordHash: string
}

export type CreateUserInput = {
  email: string
  username: string
  passwordHash: string
}

export type UpdatedUserDto = {
  username?: string
  email?: string
}

export type ChangePasswordDto = {
  currentPassword: string
  newPassword: string
}