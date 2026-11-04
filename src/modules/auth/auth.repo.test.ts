import { describe, it, expect, vi, beforeEach } from 'vitest'
import { query } from '../../db'
import { storeRefreshToken, findRefreshToken, revokeRefreshToken, revokeAllRefreshTokensByUserId, deleteRevokedOrExpiredRefreshTokensByUserId } from './auth.repo'

vi.mock('../../db', () => ({
  query: vi.fn(),
}))

const mockQuery = vi.mocked(query)

describe('auth.repo', () => {


  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery.mockResolvedValue([])
  })

  describe('storeRefreshToken', () => {
    it('should insert the token with an expiry date', async () => {
      await storeRefreshToken(1, 'hashed-refresh-token')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO refresh_tokens'),
        [1, 'hashed-refresh-token', expect.any(Date)]
      )
    })
  })

  describe('findRefreshToken', () => {
    it('should return null when token is not found', async () => {
      const result = await findRefreshToken('hashed-refresh-token')

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['hashed-refresh-token'])
      expect(result).toBeNull()
    })

    it('should return the stored refresh token when found', async () => {
      mockQuery.mockResolvedValue([{ userId: 1, tokenHash: 'refresh-token' }])

      const result = await findRefreshToken('refresh-token')

      expect(result).toEqual({ userId: 1, tokenHash: 'refresh-token' })
    })
  })

  describe('revokeRefreshToken', () => {
    it('should mark the token as revoked', async () => {
      await revokeRefreshToken('hashed-refresh-token')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('revoked = true'),
        ['hashed-refresh-token']
      )
    })
  })

  describe('revokeAllRefreshTokensByUserId', () => {
    it('should revoke all tokens for the user', async () => {
      await revokeAllRefreshTokensByUserId(1)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('revoked = true'),
        [1]
      )
    })
  })

  describe('deleteRevokedOrExpiredRefreshTokensByUserId', () => {
    it('should delete revoked or expired tokens for the user', async () => {
      await deleteRevokedOrExpiredRefreshTokensByUserId(1)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM refresh_tokens'),
        [1]
      )
    })
  })
})