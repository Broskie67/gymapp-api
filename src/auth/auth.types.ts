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

export type AuthUser = {
  id: number
  email: string
  username: string
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

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthResponse = {
  user: AuthUser
  tokens: AuthTokens
}