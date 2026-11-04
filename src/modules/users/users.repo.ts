import { query } from '../../db'
import { CreateUserInput, UpdatedUserDto, UserProfile, StoredUser } from './users.types'

export async function findUserById(userId: number): Promise<UserProfile | null> {
  const [row] = await query<UserProfile>(
    `
      SELECT
        id,
        username,
        email,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE id = $1
    `,
    [userId]
  )

  return row ?? null
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const [row] = await query<UserProfile>(
    `
      SELECT
        id,
        username,
        email,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE email = $1
    `,
    [email]
  )

  return row ?? null
}

export async function findStoredUserById(userId: number): Promise<StoredUser | null> {
  const [row] = await query<StoredUser>(
    `
      SELECT
        id,
        username,
        email,
        password_hash AS "passwordHash"
      FROM users
      WHERE id = $1
    `,
    [userId]
  )

  return row ?? null
}

export async function findStoredUserByEmail(email: string): Promise<StoredUser | null> {
  const [row] = await query<StoredUser>(
    `
      SELECT
        id,
        username,
        email,
        password_hash AS "passwordHash"
      FROM users
      WHERE email = $1
    `,
    [email]
  )

  return row ?? null
}

export async function createUser(data: CreateUserInput): Promise<StoredUser> {
  const [row] = await query<StoredUser>(
    `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        username,
        email,
        password_hash AS "passwordHash"
    `,
    [data.username, data.email, data.passwordHash]
  )

  return row
}

export async function updateUserById(
  userId: number,
  data: UpdatedUserDto,
): Promise<UserProfile | null> {
  const [row] = await query<UserProfile>(
    `
      UPDATE users
      SET
        username   = COALESCE($2, username),
        email      = COALESCE($3, email),
        updated_at = now()
      WHERE id = $1
      RETURNING
        id,
        username,
        email,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [userId, data.username ?? null, data.email ?? null]
  )

  return row ?? null
}

export async function updatePasswordById(
  userId: number,
  passwordHash: string,
): Promise<boolean> {
  const rows = await query(
    `
      UPDATE users
      SET
        password_hash = $2,
        updated_at    = now()
      WHERE id = $1
      RETURNING id
    `,
    [userId, passwordHash]
  )

  return rows.length > 0
}