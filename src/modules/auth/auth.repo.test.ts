import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDb } from '../../db'
import { storeRefreshToken, findRefreshToken, revokeRefreshToken, revokeAllRefreshTokensByUserId, deleteRevokedOrExpiredRefreshTokensByUserId } from './auth.repo'

vi.mock('../../db', () => ({
  getDb: vi.fn(),
}))

describe('auth.repo', () => {
  const queryMock = vi.fn()
  const inputMock = vi.fn()
  const requestMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    inputMock.mockReturnThis()
    requestMock.mockReturnValue({
      input: inputMock,
      query: queryMock,
    })

    vi.mocked(getDb).mockResolvedValue({
      request: requestMock,
    } as any)
  })

  describe('storeRefreshToken', () => {
    it('should execute the insert query', async () => {
      queryMock.mockResolvedValue({})

      await storeRefreshToken(1, 'hashed-refresh-token')

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(inputMock).toHaveBeenCalledWith('tokenHash', expect.anything(), 'hashed-refresh-token')
      expect(queryMock).toHaveBeenCalled()
    })
  })

  describe('findRefreshToken', () => {
    it('should return null when token is not found', async () => {
      queryMock.mockResolvedValue({
        recordset: [],
      })

      const result = await findRefreshToken('hashed-refresh-token')

      expect(inputMock).toHaveBeenCalledWith('tokenHash', expect.anything(), 'hashed-refresh-token')
      expect(result).toBeNull()
    })

    it('should return the stored refresh token when found', async () => {
      queryMock.mockResolvedValue({
        recordset: [
          {
            userId: 1,
            tokenHash: 'refresh-token',
          },
        ],
      })

      const result = await findRefreshToken('refresh-token')

      expect(result).toEqual({
        userId: 1,
        tokenHash: 'refresh-token',
      })
    })
  })

  describe('revokeRefreshToken', () => {
    it('should execute the update query', async () => {
      queryMock.mockResolvedValue({})

      await revokeRefreshToken('hashed-refresh-token')

      expect(inputMock).toHaveBeenCalledWith('tokenHash', expect.anything(), 'hashed-refresh-token')
      expect(queryMock).toHaveBeenCalled()
    })
  })

  describe('revokeAllRefreshTokensByUserId', () => {
    it('should execute the update query for all user tokens', async () => {
      queryMock.mockResolvedValue({})

      await revokeAllRefreshTokensByUserId(1)

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(queryMock).toHaveBeenCalled()
    })
  })

  describe('deleteRevokedOrExpiredRefreshTokensByUserId', () => {
    it('should execute the delete query for revoked or expired tokens', async () => {
      queryMock.mockResolvedValue({})

      await deleteRevokedOrExpiredRefreshTokensByUserId(1)

      expect(inputMock).toHaveBeenCalledWith('userId', expect.anything(), 1)
      expect(queryMock).toHaveBeenCalled()
    })
  })
})
