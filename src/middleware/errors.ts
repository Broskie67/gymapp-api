export class AppError extends Error {
  statusCode: number
  errorType: string

  constructor(statusCode: number, errorType: string, message: string) {
    super(message)
    this.statusCode = statusCode
    this.errorType = errorType
    this.name = 'AppError'
  }
}

export function badRequest(message: string): AppError {
  return new AppError(400, 'BadRequest', message)
}

export function unauthorized(message: string): AppError {
  return new AppError(401, 'Unauthorized', message)
}

export function forbidden(message: string): AppError {
  return new AppError(403, 'Forbidden', message)
}

export function notFound(message: string): AppError {
  return new AppError(404, 'NotFound', message)
}

export function conflict(message: string): AppError {
  return new AppError(409, 'Conflict', message)
}

export function internalServerError(message = 'Internal server error'): AppError {
  return new AppError(500, 'InternalServerError', message)
}