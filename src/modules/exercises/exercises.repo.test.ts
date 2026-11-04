import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listExercises, findExerciseById } from './exercises.repo'
import { query } from '../../db'

vi.mock('../../db', () => ({
  query: vi.fn(),
}))
const mockQuery = vi.mocked(query)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listExercises', () => {
  it('should return a list of exercises', async () => {
    mockQuery.mockResolvedValue([
        { id: 1, name: 'Barbell Bench Press', muscle_group: 'Chest' },
        { id: 2, name: 'Barbell Curl', muscle_group: 'Arms' },
      ])

    const result = await listExercises()

    expect(result).toEqual([
      { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest' },
      { id: 2, name: 'Barbell Curl', muscleGroup: 'Arms' },
    ])
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it('should return an empty array when no exercises exist', async () => {
    mockQuery.mockResolvedValue([])

    const result = await listExercises()

    expect(result).toEqual([])
  })
})

describe('findExerciseById', () => {
  it('should return an exercise when found', async () => {
    const now = new Date()
    const exercise = {
      id: 1,
      name: 'Barbell Bench Press',
      muscle_group: 'Chest',
      exercise_type: 'Compound',
      equipment: 'Barbell',
      created_at: now,
      updated_at: now,
    }

    mockQuery.mockResolvedValue([exercise])

    const result = await findExerciseById(1)

    expect(result).toEqual(exercise)
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), [1])
  })

  it('should return null when exercise is not found', async () => {
    mockQuery.mockResolvedValue([])

    const result = await findExerciseById(99)

    expect(result).toBeNull()
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [99])
  })
})