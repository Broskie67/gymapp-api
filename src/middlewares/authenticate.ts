import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { unauthorized } from '../middlewares/errors'
import { JwtPayload } from '../modules/auth/auth.types'

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(unauthorized('Missing or invalid authorization header'))
  }

  const token = authHeader.substring(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload
    req.user = payload
    return next()
  } catch {
    return next(unauthorized('Invalid or expired access token'))
  }
}