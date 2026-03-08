import { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.login(req.body)
        res.status(201).json(result)
    } catch (error) {
        next(error)
    }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshToken(req.body)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body)
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}