import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('./db', () => ({
  getDb: vi.fn(),
}))

import app from './app'
import { getDb } from './db'

describe('app', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /', () => {
    it('should return hello world message', async () => {
      const response = await request(app).get('/')

      expect(response.status).toBe(200)
      expect(response.text).toBe('Hello World with TypeScript and Express!')
    })
  })

  describe('GET /health/db', () => {
    it('should return database health response', async () => {
      vi.mocked(getDb).mockResolvedValue({
        request: vi.fn().mockReturnValue({
          query: vi.fn().mockResolvedValue({
            recordset: [{ ok: 1 }],
          }),
        }),
      } as any)

      const response = await request(app).get('/health/db')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        db: { ok: 1 },
      })
    })

    it('should return 500 if database check fails', async () => {
      vi.mocked(getDb).mockRejectedValue(new Error('DB error'))

      const response = await request(app).get('/health/db')

      expect(response.status).toBe(500)
      expect(response.body).toMatchObject({
        status: 500,
        error: 'InternalServerError',
        message: 'Internal server error',
        path: '/health/db',
      })
    })
  })
})