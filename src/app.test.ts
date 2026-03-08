import request from 'supertest'
import { describe, it, expect, vi } from 'vitest'
import app from './app'
import * as dbModule from './db'

describe('app', () => {
  describe('GET /', () => {
    it('should return hello world message', async () => {
      const response = await request(app).get('/')

      expect(response.status).toBe(200)
      expect(response.text).toBe('Hello World with TypeScript and Express!')
    })
  })

  describe('GET /health/db', () => {
    it('should return database health response', async () => {
      const query = vi.fn().mockResolvedValue({
        recordset: [{ ok: 1 }],
      })

      const requestMock = vi.fn().mockReturnValue({
        query,
      })

      vi.spyOn(dbModule, 'getPool').mockResolvedValue({
        request: requestMock,
      } as any)

      const response = await request(app).get('/health/db')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        db: { ok: 1 },
      })
    })

    it('should return 500 if database check fails', async () => {
      vi.spyOn(dbModule, 'getPool').mockRejectedValue(new Error('DB error'))

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