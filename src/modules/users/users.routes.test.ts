import request from 'supertest'
import express from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import usersRoutes from './users.routes'
import * as userController from './users.controller'
import { authenticate } from '../../middlewares/authenticate'
import { validateUpdateProfile, validateUpdatePassword } from './users.validation'

vi.mock('./users.controller', () => ({
  getProfile: vi.fn((_req, res) => res.status(200).json({ ok: true })),
  updateProfile: vi.fn((_req, res) => res.status(200).json({ ok: true })),
  updatePassword: vi.fn((_req, res) => res.status(200).json({ ok: true })),
}))

vi.mock('../../middlewares/authenticate', () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.user = { userId: 1, email: 'test@test.com' }
    next()
  }),
}))

vi.mock('./users.validation', () => ({
  validateUpdateProfile: vi.fn((_req, _res, next) => next()),
  validateUpdatePassword: vi.fn((_req, _res, next) => next()),
}))

describe('users.routes', () => {
  let app: express.Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/users', usersRoutes)
    vi.clearAllMocks()
  })

  it('should route GET /users/me to getProfile controller', async () => {
    const response = await request(app).get('/users/me')

    expect(response.status).toBe(200)
    expect(authenticate).toHaveBeenCalled()
    expect(userController.getProfile).toHaveBeenCalled()
  })

  it('should route PATCH /users/me to updateProfile controller', async () => {
    const response = await request(app)
      .patch('/users/me')
      .send({ username: 'new-name' })

    expect(response.status).toBe(200)
    expect(authenticate).toHaveBeenCalled()
    expect(validateUpdateProfile).toHaveBeenCalled()
    expect(userController.updateProfile).toHaveBeenCalled()
  })

  it('should route PATCH /users/me/password to updatePassword controller', async () => {
    const response = await request(app)
      .patch('/users/me/password')
      .send({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      })

    expect(response.status).toBe(200)
    expect(authenticate).toHaveBeenCalled()
    expect(validateUpdatePassword).toHaveBeenCalled()
    expect(userController.updatePassword).toHaveBeenCalled()
  })
})
