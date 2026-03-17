import sql from 'mssql'
import { getDb } from '../../db'
import { CreateUserInput, StoredRefreshToken, StoredUser, } from './auth.types'


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

  const row = result.recordset[0]

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
  }
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
      OUTPUT
        INSERTED.id,
        INSERTED.username,
        INSERTED.email,
        INSERTED.password_hash AS passwordHash
      VALUES (@username, @email, @passwordHash, SYSDATETIME(), SYSDATETIME())
    `)

  const row = result.recordset[0]

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.passwordHash,
  }
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

  const row = result.recordset[0]

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.passwordHash,
  }
}

export async function storeRefreshToken(userId: number, tokenHash: string): Promise<void> {
  const pool = await getDb()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('tokenHash', sql.NVarChar(sql.MAX), tokenHash)
    .input('expiresAt', sql.DateTime, expiresAt)
    .query(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked)
      VALUES (@userId, @tokenHash, @expiresAt, 0)
    `)
}

export async function findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('tokenHash', sql.NVarChar(sql.MAX), tokenHash)
    .query(`
      SELECT
        user_id AS userId,
        token_hash AS tokenHash
      FROM refresh_tokens
      WHERE token_hash = @tokenHash
        AND revoked = 0
        AND expires_at > GETUTCDATE()
    `)

  if (result.recordset.length === 0) {
    return null
  }

  const row = result.recordset[0]

  return {
    userId: row.userId,
    refreshToken: row.refreshToken,
  }
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  const pool = await getDb()

  await pool
    .request()
    .input('tokenHash', sql.NVarChar(sql.MAX), tokenHash)
    .query(`
      UPDATE refresh_tokens
      SET revoked = 1
      WHERE token_hash = @tokenHash
    `)
}

export async function revokeAllRefreshTokensByUserId(userId: number): Promise<void> {
  const pool = await getDb()
  await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      UPDATE refresh_tokens
      SET revoked = 1
      WHERE user_id = @userId
        AND revoked = 0
    `)
}

export async function deleteRevokedOrExpiredRefreshTokensByUserId(userId: number): Promise<void> {
  const pool = await getDb()

  await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      DELETE FROM refresh_tokens
      WHERE user_id = @userId
        AND (
          revoked = 1
          OR expires_at < GETUTCDATE()
        )
    `)
}