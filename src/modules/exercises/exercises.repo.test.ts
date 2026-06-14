import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listExercises, findExerciseById } from './exercises.repo'

vi.mock('../../db', () => ({
  getDb: vi.fn(),
}))

vi.mock('mssql', () => ({
  default: {
    Int: 'INT',
  },
}))

import { getDb } from '../../db'

const mockQuery = vi.fn()
const mockInput = vi.fn()
const mockRequest = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  mockInput.mockReturnValue({ query: mockQuery })
  mockRequest.mockReturnValue({ input: mockInput, query: mockQuery })
  vi.mocked(getDb).mockResolvedValue({ request: mockRequest } as any)
})

describe('listExercises', () => {
  it('should return a list of exercises', async () => {
    mockQuery.mockResolvedValue({
      recordset: [
        { id: 1, name: 'Barbell Bench Press', muscle_group: 'Chest' },
        { id: 2, name: 'Barbell Curl', muscle_group: 'Arms' },
      ],
    })

    const result = await listExercises()

    expect(result).toEqual([
      { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest' },
      { id: 2, name: 'Barbell Curl', muscleGroup: 'Arms' },
    ])
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it('should return an empty array when no exercises exist', async () => {
    mockQuery.mockResolvedValue({ recordset: [] })

    const result = await listExercises()

    expect(result).toEqual([])
  })
})

describe('findExerciseById', () => {
  it('should return an exercise when found', async () => {
    const now = new Date()

    mockQuery.mockResolvedValue({
      recordset: [
        {
          id: 1,
          name: 'Barbell Bench Press',
          muscle_group: 'Chest',
          exercise_type: 'Compound',
          equipment: 'Barbell',
          created_at: now,
          updated_at: now,
        },
      ],
    })

    const result = await findExerciseById(1)

    expect(result).toEqual({
      id: 1,
      name: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      exerciseType: 'Compound',
      equipment: 'Barbell',
      createdAt: now,
      updatedAt: now,
    })
    expect(mockInput).toHaveBeenCalledWith('exerciseId', 'INT', 1)
  })

  it('should return null when exercise is not found', async () => {
    mockQuery.mockResolvedValue({ recordset: [] })

    const result = await findExerciseById(99)

    expect(result).toBeNull()
    expect(mockInput).toHaveBeenCalledWith('exerciseId', 'INT', 99)
  })
})