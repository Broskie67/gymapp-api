import sql from 'mssql'
import { CreateUserInput, StoredRefreshToken, StoredUser,
} from './auth.types'


export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const result = await sql.query`
    SELECT id, username, email, passwordHash
    FROM users
    WHERE email = ${email}
  `

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0] as StoredUser
}

export async function createUser(data: CreateUserInput): Promise<StoredUser> {
  const result = await sql.query`
    INSERT INTO users (username, email, passwordHash)
    OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.passwordHash
    VALUES (${data.username}, ${data.email}, ${data.passwordHash})
  `

  return result.recordset[0] as StoredUser
}

export async function findUserById(userId: number): Promise<StoredUser | null> {
  const result = await sql.query`
    SELECT id, username, email, passwordHash
    FROM users
    WHERE id = ${userId}
  `

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0] as StoredUser
}

export async function storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
  await sql.query`
    INSERT INTO refresh_tokens (userId, refreshToken)
    VALUES (${userId}, ${refreshToken})
  `
}

export async function findRefreshToken(refreshToken: string): Promise<StoredRefreshToken | null> {
  const result = await sql.query`
    SELECT userId, refreshToken
    FROM refresh_tokens
    WHERE refreshToken = ${refreshToken}
  `

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0] as StoredRefreshToken
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await sql.query`
    DELETE FROM refresh_tokens
    WHERE refreshToken = ${refreshToken}
  `
}