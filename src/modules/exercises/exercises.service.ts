import { notFound, internalServerError } from '../../middlewares/errors'
import * as exerciseRepo from './exercises.repo'
import { Exercise, ExerciseSummary } from './exercises.types'

export async function getExercises(): Promise<ExerciseSummary[]> {
  return exerciseRepo.listExercises()
}

export async function getExerciseById(exerciseId: number): Promise<Exercise> {
  const exercise = await exerciseRepo.findExerciseById(exerciseId)

  if(!exercise){
    throw notFound('exercise not found')
  }

  return exercise
}