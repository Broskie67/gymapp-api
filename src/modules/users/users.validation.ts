import { Request, Response, NextFunction } from 'express'
import { badRequest } from '../../middlewares/errors'

export function validateUpdateProfile(req: Request, _res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(badRequest('Request body must be an object'))
  }

  const { username, email, ...extraFields } = req.body

  if (Object.keys(extraFields).length > 0) {
    return next(badRequest('Only username and email can be updated'))
  }

  if (username === undefined && email === undefined) {
    return next(badRequest('At least one field must be provided'))
  }

  const sanitizedBody: { username?: string; email?: string } = {}

  if (username !== undefined) {
    if (typeof username !== 'string' || username.trim().length === 0) {
      return next(badRequest('Username must be a non-empty string'))
    }

    sanitizedBody.username = username.trim()
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      return next(badRequest('Email must be a non-empty string'))
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalizedEmail)) {
      return next(badRequest('Email must be a valid email address'))
    }

    sanitizedBody.email = normalizedEmail
  }

  req.body = sanitizedBody
  next()
}

export function validateUpdatePassword(req: Request, _res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(badRequest('Request body must be an object'))
  }

  const { currentPassword, newPassword, ...extraFields } = req.body

  if (Object.keys(extraFields).length > 0) {
    return next(badRequest('Only currentPassword and newPassword are allowed'))
  }

  if (typeof currentPassword !== 'string' || currentPassword.trim().length === 0) {
    return next(badRequest('Current password is required'))
  }

  if (typeof newPassword !== 'string' || newPassword.trim().length === 0) {
    return next(badRequest('New password is required'))
  }

  if (currentPassword === newPassword) {
    return next(badRequest('New password must be different from current password'))
  }

  if (newPassword.length < 6) {
    return next(badRequest('New password must be at least 6 characters long'))
  }

  req.body = {
    currentPassword,
    newPassword,
  }

  next()
}