import sql from 'mssql'
import { getDb } from '../db'
import { CreateUserInput, StoredRefreshToken, StoredUser,
} from './auth.types'


export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .query(`
      SELECT id, username, email, password_hash
      FROM users
      WHERE email = @email
    `)

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0] as StoredUser
}

export async function createUser(data: CreateUserInput): Promise<StoredUser> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('username', sql.NVarChar, data.username)
    .input('email', sql.NVarChar, data.email)
    .input('passwordHash', sql.NVarChar, data.passwordHash)
    .query(`
      INSERT INTO users (username, email, password_hash, created_at, updated_at)
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.password_hash
      VALUES (@username, @email, @passwordHash, SYSDATETIME(), SYSDATETIME())
    `)

  return result.recordset[0] as StoredUser
}

export async function findUserById(userId: number): Promise<StoredUser | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT
        id,
        username,
        email,
        password_hash AS passwordHash
      FROM users
      WHERE id = @userId
    `)

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0] as StoredUser
}

export async function storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
  const pool = await getDb()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('token', sql.NVarChar(sql.MAX), refreshToken)
    .input('expiresAt', sql.DateTime, expiresAt)
    .query(`
      INSERT INTO refresh_tokens (user_id, token, expires_at, revoked)
      VALUES (@userId, @token, @expiresAt, 0)
    `)
}

export async function findRefreshToken(refreshToken: string): Promise<StoredRefreshToken | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('refreshToken', sql.NVarChar, refreshToken)
    .query(`
      SELECT
        user_id AS userId,
        refresh_tokens AS refreshToken
      FROM refresh_tokens
      WHERE refresh_tokens = @refreshToken
    `)

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0] as StoredRefreshToken
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const pool = await getDb()

  await pool
    .request()
    .input('refreshToken', sql.NVarChar, refreshToken)
    .query(`
      DELETE FROM refresh_tokens
      WHERE refresh_token = @refreshToken
    `)
}