import sql from 'mssql'
import { getDb } from '../../db'
import { Exercise, ExerciseSummary } from './exercises.types'

export async function listExercises(): Promise<ExerciseSummary[]> {
  const pool = await getDb()

  const result = await pool
    .request()
    .query(`SELECT id, name, muscle_group FROM exercises`)

  return result.recordset.map(row => ({
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
  }))
}

export async function findExerciseById(exerciseId: number): Promise<Exercise | null> {
  const pool = await getDb()

   const result = await pool
    .request()
    .input('exerciseId', sql.Int, exerciseId)
    .query(`
      SELECT id, name, muscle_group, exercise_type, equipment, created_at, updated_at
      FROM exercises
      WHERE id = @exerciseId
    `)
  
  if (result.recordset.length === 0) {
    return null
  }

  const row = result.recordset[0]

  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    exerciseType: row.exercise_type,
    equipment: row.equipment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}