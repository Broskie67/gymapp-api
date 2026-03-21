import sql from 'mssql'
import { getDb } from '../../db'
import { StoredRefreshToken } from './auth.types'

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
    tokenHash: row.tokenHash,
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