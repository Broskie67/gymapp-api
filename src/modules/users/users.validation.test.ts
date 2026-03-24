import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateUpdateProfile, validateUpdatePassword } from './users.validation'

describe('users.validation', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { body: {} }
    res = {}
    next = vi.fn()
  })

  describe('validateUpdateProfile', () => {
    it('rejects null body', () => {
      req.body = null

      validateUpdateProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Request body must be an object',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects array body', () => {
      req.body = []

      validateUpdateProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Request body must be an object',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects empty body', () => {
      req.body = {}

      validateUpdateProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'At least one field must be provided',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects extra fields', () => {
      req.body = { username: 'nathan', role: 'admin' }

      validateUpdateProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Only username and email can be updated',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects empty username', () => {
      req.body = { username: '   ' }

      validateUpdateProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Username must be a non-empty string',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects invalid email', () => {
      req.body = { email: 'invalid-email' }

      validateUpdateProfile(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email must be a valid email address',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('accepts and trims username', () => {
      req.body = { username: '  nathan  ' }

      validateUpdateProfile(req, res, next)

      expect(req.body).toEqual({ username: 'nathan' })
      expect(next).toHaveBeenCalledWith()
    })

    it('accepts and normalizes email', () => {
      req.body = { email: '  TEST@Email.com  ' }

      validateUpdateProfile(req, res, next)

      expect(req.body).toEqual({ email: 'test@email.com' })
      expect(next).toHaveBeenCalledWith()
    })

    it('accepts username and email together', () => {
      req.body = { username: '  nathan  ', email: '  TEST@Email.com  ' }

      validateUpdateProfile(req, res, next)

      expect(req.body).toEqual({
        username: 'nathan',
        email: 'test@email.com',
      })
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('validateUpdatePassword', () => {
    it('rejects null body', () => {
      req.body = null

      validateUpdatePassword(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Request body must be an object',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects extra fields', () => {
      req.body = {
        currentPassword: 'old-password',
        newPassword: 'new-password',
        role: 'admin',
      }

      validateUpdatePassword(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Only currentPassword and newPassword are allowed',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects missing currentPassword', () => {
      req.body = { newPassword: 'new-password' }

      validateUpdatePassword(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Current password is required',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects missing newPassword', () => {
      req.body = { currentPassword: 'old-password' }

      validateUpdatePassword(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'New password is required',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects same passwords', () => {
      req.body = {
        currentPassword: 'same-password',
        newPassword: 'same-password',
      }

      validateUpdatePassword(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'New password must be different from current password',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('rejects short new password', () => {
      req.body = {
        currentPassword: 'old-password',
        newPassword: 'short',
      }

      validateUpdatePassword(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'New password must be at least 6 characters long',
          statusCode: 400,
          errorType: 'BadRequest',
        }),
      )
    })

    it('accepts valid password payload', () => {
      req.body = {
        currentPassword: 'old-password',
        newPassword: 'new-password-123',
      }

      validateUpdatePassword(req, res, next)

      expect(req.body).toEqual({
        currentPassword: 'old-password',
        newPassword: 'new-password-123',
      })
      expect(next).toHaveBeenCalledWith()
    })
  })
})
