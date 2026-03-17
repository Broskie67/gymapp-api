import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as authRepo from './auth.repo'
import { AuthResponse, AuthTokens, JwtPayload, LoginDto, RefreshDto, RegisterDto } from './auth.types'
import { conflict, unauthorized, internalServerError } from '../../middlewares/errors'
import { hashToken } from '../../utils/tokenHash'

/**
 * Creates a new user, generates authentication tokens,
 * and stores the refresh token in the database.
 *
 * @param data Data required to register the user
 * @returns The created user's public information along with their authentication tokens
 * @throws Error If the email address is already in use
 */
export async function register(data: RegisterDto): Promise<AuthResponse> {
  const existingUser = await authRepo.findUserByEmail(data.email)

  if (existingUser) {
    throw conflict('Email already in use')
  }

  const passwordHash = await bcrypt.hash(data.password, 10)

  const createdUser = await authRepo.createUser({
    username: data.username,
    email: data.email,
    passwordHash,
  })

  const tokens = generateTokens(createdUser.id, createdUser.email)

  await authRepo.storeRefreshToken(createdUser.id, tokens.refreshToken)

  return {
    user: {
      id: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
    },
    tokens,
  }
}

/**
 * Authenticates a user using their email address and password.
 *
 * Checks whether a user exists for the provided email, compares the password
 * against the stored hash, generates authentication tokens, and then stores
 * the refresh token in the database.
 *
 * @param data User login data
 * @param data.email Email address used for authentication
 * @param data.password Plain text password to validate
 * @returns An object containing the user's public information and authentication tokens
 * @throws Error If the email or password is invalid
 */
export async function login(data: LoginDto): Promise<AuthResponse> {
  const user = await authRepo.findUserByEmail(data.email)

  if (!user || !user.passwordHash) {
    throw unauthorized('Invalid credentials')
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

  if (!isPasswordValid) {
    throw unauthorized('Invalid credentials')
  }

  await authRepo.deleteRevokedOrExpiredRefreshTokensByUserId(user.id)
  await authRepo.revokeAllRefreshTokensByUserId(user.id)

  const tokens = generateTokens(user.id, user.email)
  const refreshTokenhash = hashToken(tokens.refreshToken)

  await authRepo.storeRefreshToken(user.id, refreshTokenhash)

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    tokens,
  }
}

/**
 * Refreshes a user's authentication tokens using a valid refresh token.
 *
 * Verifies that the provided refresh token exists, retrieves the associated user,
 * generates a new pair of authentication tokens, revokes the old refresh token,
 * and stores the new refresh token in the database.
 *
 * @param data Data required to refresh authentication tokens
 * @param data.refreshToken Refresh token used to generate new authentication tokens
 * @returns A new pair of authentication tokens
 * @throws Error If the refresh token is invalid
 * @throws Error If the associated user cannot be found
 */
export async function refreshToken(data: RefreshDto): Promise<AuthTokens> {
  let payload: JwtPayload

  try {
    payload = jwt.verify(
      data.refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as JwtPayload
  } catch {
    throw unauthorized('Invalid refresh token')
  }

  const refreshTokenHash = hashToken(data.refreshToken)
  const savedToken = await authRepo.findRefreshToken(refreshTokenHash)

  if (!savedToken) {
    throw unauthorized('Invalid refresh token')
  }

  const user = await authRepo.findUserById(savedToken.userId)

  if (!user) {
    throw unauthorized('Invalid refresh token')
  }

  if (user.id !== payload.userId) {
    throw unauthorized('Invalid refresh token')
  }

  const tokens = generateTokens(user.id, user.email)
  const newRefreshTokenHash = hashToken(tokens.refreshToken)

  await authRepo.revokeRefreshToken(refreshTokenHash)

  await authRepo.storeRefreshToken(user.id, newRefreshTokenHash)

  return tokens
}

/**
 * Logs out a user by revoking the provided refresh token.
 *
 * Removes the refresh token from the database so it can no longer be used
 * to generate new authentication tokens.
 *
 * @param refreshToken Refresh token to revoke
 * @returns A promise that resolves when the refresh token has been revoked
 */
export async function logout(refreshToken: string): Promise<void> {
  await authRepo.revokeRefreshToken(refreshToken)
}

/**
 * Generates a new access token and refresh token for a user.
 *
 * Creates two signed JWTs containing the user's identifier and email address:
 * a short-lived access token and a longer-lived refresh token.
 *
 * @param userId Unique identifier of the user
 * @param email Email address of the user
 * @returns An object containing the generated access token and refresh token
 */
function generateTokens(userId: number, email: string): AuthTokens {
  const payload: JwtPayload = {
    userId,
    email,
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET
  const refreshSecret = process.env.JWT_REFRESH_SECRET

  if (!accessSecret || !refreshSecret) {
    throw internalServerError('JWT secrets are not configured')
  }

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn: '15m',
  })

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: '7d',
  })

  return {
    accessToken,
    refreshToken,
  }
}