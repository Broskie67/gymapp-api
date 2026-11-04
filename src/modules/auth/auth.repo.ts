import { query } from '../../db'
import { StoredRefreshToken } from './auth.types'

export async function storeRefreshToken(userId: number, tokenHash: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked)
      VALUES ($1, $2, $3, false)
    `,
    [userId, tokenHash, expiresAt]
  )
   
}

export async function findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
  const [row] = await query<StoredRefreshToken>(
    `
      SELECT
        user_id    AS "userId",
        token_hash AS "tokenHash"
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked = false
        AND expires_at > now()
    `,
    [tokenHash]
  )

  return row ?? null
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await query(
    `
      UPDATE refresh_tokens
      SET revoked = true
      WHERE token_hash = $1
    `,
    [tokenHash]
  )
}

export async function revokeAllRefreshTokensByUserId(userId: number): Promise<void> {
  await query(
    `
      UPDATE refresh_tokens
      SET revoked = true
      WHERE user_id = $1
        AND revoked = false
    `,
    [userId]
  )
}

export async function deleteRevokedOrExpiredRefreshTokensByUserId(userId: number): Promise<void> {
  await query(
    `
      DELETE FROM refresh_tokens
      WHERE user_id = $1
        AND (
          revoked = true
          OR expires_at < now()
        )
    `,
    [userId]
  )
}