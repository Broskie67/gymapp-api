import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('./db', () => ({
  query: vi.fn(),
}))

import app from './app'
import { query } from './db'

const mockQuery = vi.mocked(query)

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
      mockQuery.mockResolvedValue([{ ok: 1 }])

      const response = await request(app).get('/health/db')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ db: { ok: 1 } })
    })

    it('should return 500 if database check fails', async () => {
      mockQuery.mockRejectedValue(new Error('DB error'))

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
