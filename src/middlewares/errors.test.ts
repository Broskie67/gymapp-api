import { describe, it, expect } from 'vitest'
import {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalServerError,
} from './errors'

describe('errors', () => {
  describe('AppError', () => {
    it('should create an AppError with the correct properties', () => {
      const error = new AppError(418, 'Teapot', 'I am a teapot')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error.name).toBe('AppError')
      expect(error.message).toBe('I am a teapot')
      expect(error.statusCode).toBe(418)
      expect(error.errorType).toBe('Teapot')
    })
  })

  describe('badRequest', () => {
    it('should return a 400 BadRequest error', () => {
      const error = badRequest('Invalid input')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(400)
      expect(error.errorType).toBe('BadRequest')
      expect(error.message).toBe('Invalid input')
    })
  })

  describe('unauthorized', () => {
    it('should return a 401 Unauthorized error', () => {
      const error = unauthorized('Invalid credentials')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(401)
      expect(error.errorType).toBe('Unauthorized')
      expect(error.message).toBe('Invalid credentials')
    })
  })

  describe('forbidden', () => {
    it('should return a 403 Forbidden error', () => {
      const error = forbidden('Access denied')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(403)
      expect(error.errorType).toBe('Forbidden')
      expect(error.message).toBe('Access denied')
    })
  })

  describe('notFound', () => {
    it('should return a 404 NotFound error', () => {
      const error = notFound('Resource not found')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(404)
      expect(error.errorType).toBe('NotFound')
      expect(error.message).toBe('Resource not found')
    })
  })

  describe('conflict', () => {
    it('should return a 409 Conflict error', () => {
      const error = conflict('Email already in use')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(409)
      expect(error.errorType).toBe('Conflict')
      expect(error.message).toBe('Email already in use')
    })
  })

  describe('internalServerError', () => {
    it('should return a 500 InternalServerError with custom message', () => {
      const error = internalServerError('Database failure')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(500)
      expect(error.errorType).toBe('InternalServerError')
      expect(error.message).toBe('Database failure')
    })

    it('should return a 500 InternalServerError with default message', () => {
      const error = internalServerError()

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(500)
      expect(error.errorType).toBe('InternalServerError')
      expect(error.message).toBe('Internal server error')
    })
  })
})