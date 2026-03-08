import { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'
import { formatSuccessResponse } from '../utils/formatErrorResponse'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(formatSuccessResponse(201, 'User registered successfully', result, req.originalUrl))
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body)
    res.status(200).json(formatSuccessResponse(200, 'Login successful', result, req.originalUrl))
  } catch (error) {
    next(error)
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshToken(req.body)
    res.status(200).json(formatSuccessResponse(200, 'Token refreshed successfully', result, req.originalUrl))
  } catch (error) {
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body.refreshToken)
    res.status(200).json(formatSuccessResponse(200, 'Logged out successfully', null, req.originalUrl))
  } catch (error) {
    next(error)
  }
}