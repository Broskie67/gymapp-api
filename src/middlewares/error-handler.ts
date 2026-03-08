import { Request, Response, NextFunction } from 'express'
import { AppError } from './errors'
import { formatErrorResponse } from '../utils/formatErrorResponse'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      formatErrorResponse(
        err.statusCode,
        err.errorType,
        err.message,
        req.originalUrl
      )
    )
  }

  console.error(err)

  return res.status(500).json(
    formatErrorResponse(
      500,
      'InternalServerError',
      'Internal server error',
      req.originalUrl
    )
  )
}