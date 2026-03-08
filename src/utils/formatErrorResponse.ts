type ErrorResponse = {
  status: number
  error: string
  message: string
  path: string
  timestamp: string
}

type SuccessResponse<T = unknown> = {
  status: number
  message: string
  data: T
  path: string
  timestamp: string
}

export function formatErrorResponse(
  statusCode: number,
  errorType: string,
  message: string,
  path: string
): ErrorResponse {
  return {
    status: statusCode,
    error: errorType,
    message,
    path,
    timestamp: new Date().toISOString(),
  }
}

export function formatSuccessResponse<T>(
  statusCode: number,
  message: string,
  data: T,
  path: string
): SuccessResponse<T> {
  return {
    status: statusCode,
    message,
    data,
    path,
    timestamp: new Date().toISOString(),
  }
}