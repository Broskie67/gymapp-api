import sql from 'mssql'
import { getDb } from '../../db'
import { CreateUserInput, UpdatedUserDto, UserProfile, StoredUser} from './users.types'

export async function findUserById(userId: number): Promise<UserProfile | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT id, username, email, created_at, updated_at
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .query(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE email = @email
    `)

    if(result.recordset.length === 0) {
      return null
    }

    const row = result.recordset[0]

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
}

export async function findStoredUserById(userId: number): Promise<StoredUser | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT id, username, email, password_hash
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
    passwordHash: row.password_hash
  }
  
}

export async function findStoredUserByEmail(email: string): Promise<StoredUser | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .query(`
      SELECT id, username, email, password_hash
      FROM users
      WHERE email = @email
    `)

    if(result.recordset.length === 0) {
      return null
    }

    const row = result.recordset[0]

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash
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

export async function updateUserById(
  userId: number,
  data: UpdatedUserDto,
): Promise<UserProfile | null> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('username', sql.NVarChar, data.username ?? null)
    .input('email', sql.NVarChar, data.email ?? null)
    .query(`
      UPDATE users
      SET
        username = COALESCE(@username, username),
        email = COALESCE(@email, email),
        updated_at = GETUTCDATE()
      OUTPUT inserted.id, inserted.username, inserted.email, inserted.created_at, inserted.updated_at
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function updatePasswordById(
  userId: number,
  passwordHash: string,
): Promise<boolean> {
  const pool = await getDb()

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .input('passwordHash', sql.NVarChar, passwordHash)
    .query(`
      UPDATE users
      SET
        password_hash = @passwordHash,
        updated_at = GETUTCDATE()
      WHERE id = @userId
    `)

  return result.rowsAffected[0] > 0
}