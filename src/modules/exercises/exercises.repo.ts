
import { query } from '../../db'
import { Exercise, ExerciseSummary } from './exercises.types'

export async function listExercises(): Promise<ExerciseSummary[]> {
  const result = await query(`SELECT id, name, muscle_group FROM exercises`)

  return result.map(row => ({
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
  }))
}

export async function findExerciseById(exerciseId: number): Promise<Exercise | null> {

   const [row] = await query(`
      SELECT id, name, muscle_group, exercise_type, equipment, created_at, updated_at
      FROM exercises
      WHERE id = $1
    `,
    [exerciseId]
  )
  return row ?? null 
}