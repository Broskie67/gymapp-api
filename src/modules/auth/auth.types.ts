import { PublicUser } from '../users/users.types'
export type RegisterDto = {
  email: string
  password: string
  username: string
}

export type LoginDto = {
  email: string
  password: string
}

export type RefreshDto = {
  refreshToken: string
}

export type JwtPayload = {
  userId: number
  email: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthResponse = {
  user: PublicUser
  tokens: AuthTokens
}

export type StoredRefreshToken = {
  userId: number
  tokenHash: string
}