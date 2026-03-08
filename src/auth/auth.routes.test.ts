import request from 'supertest'
import express from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import authRoutes from './auth.routes'
import * as authController from './auth.controller'

vi.mock('./auth.controller', () => ({
  register: vi.fn((req, res) => res.status(201).json({ ok: true })),
  login: vi.fn((req, res) => res.status(200).json({ ok: true })),
  refreshToken: vi.fn((req, res) => res.status(200).json({ ok: true })),
  logout: vi.fn((req, res) => res.status(200).json({ ok: true })),
}))

describe('auth.routes', () => {
  let app: express.Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/auth', authRoutes)
    vi.clearAllMocks()
  })

  it('should route POST /auth/register to register controller', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'test', email: 'test@test.com', password: '123456' })

    expect(response.status).toBe(201)
    expect(authController.register).toHaveBeenCalled()
  })

  it('should route POST /auth/login to login controller', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' })

    expect(response.status).toBe(200)
    expect(authController.login).toHaveBeenCalled()
  })

  it('should route POST /auth/refresh to refreshToken controller', async () => {
    const response = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'abc' })

    expect(response.status).toBe(200)
    expect(authController.refreshToken).toHaveBeenCalled()
  })

  it('should route POST /auth/logout to logout controller', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .send({ refreshToken: 'abc' })

    expect(response.status).toBe(200)
    expect(authController.logout).toHaveBeenCalled()
  })
})