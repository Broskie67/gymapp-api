import { Request, Response, NextFunction } from 'express'
import * as userService from './users.service'
import { formatSuccessResponse } from '../../utils/formatErrorResponse'

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.getProfile(req.user!.userId)
    res.status(200).json(formatSuccessResponse(200, 'Profile retrieved successfully', result, req.originalUrl)) 
  } catch (error) {
      next(error)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.updateProfile(req.user!.userId, req.body)

    res.status(200).json(formatSuccessResponse(200, 'Profile updated successfully', result, req.originalUrl))
  } catch (error) {
    next(error)
  }
}

export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.updatePassword(req.user!.userId, req.body)

    res.status(200).json(formatSuccessResponse(200, 'Password updated successfully', null, req.originalUrl))
    } catch (error){
      next(error)
    }
}