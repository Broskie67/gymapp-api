import { Request, Response, NextFunction } from 'express'
import * as exerciseService from './exercises.service'
import { formatSuccessResponse } from '../../utils/formatErrorResponse'

export async function getExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await exerciseService.getExercises()
    res.status(200).json(formatSuccessResponse(200, 'success', result, req.originalUrl))
  } catch (error) {
    next(error)
  }
}

export async function getExerciseById(req: Request<{id: string}>, res: Response, next: NextFunction) {
  try {
    const exerciseId = parseInt(req.params.id)
    const result = await exerciseService.getExerciseById(exerciseId)
    res.status(200).json(formatSuccessResponse(200, 'exercise retrieved succesfully', result, req.originalUrl))
  } catch (error) {
    next(error)
  }
}