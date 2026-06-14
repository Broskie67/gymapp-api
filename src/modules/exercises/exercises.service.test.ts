import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as exerciseRepo from './exercises.repo'
import { getExercises, getExerciseById } from './exercises.service'

vi.mock('./exercises.repo', () => ({
  listExercises: vi.fn(),
  findExerciseById: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getExercises', () => {
  it('should return a list of exercises', async () => {
    const mockExercises = [
      { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest' },
      { id: 2, name: 'Barbell Curl', muscleGroup: 'Arms' },
    ]

    vi.mocked(exerciseRepo.listExercises).mockResolvedValue(mockExercises)

    const result = await getExercises()

    expect(result).toEqual(mockExercises)
    expect(exerciseRepo.listExercises).toHaveBeenCalledTimes(1)
  })
})

describe('getExerciseById', () => {
  it('should return an exercise when found', async () => {
    const mockExercise = { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest', exerciseType: 'Compound', equipment: 'Barbell', createdAt: new Date(), updatedAt: new Date() }

    vi.mocked(exerciseRepo.findExerciseById).mockResolvedValue(mockExercise)

    const result = await getExerciseById(1)

    expect(result).toEqual(mockExercise)
    expect(exerciseRepo.findExerciseById).toHaveBeenCalledWith(1)
  })

  it('should throw notFound when exercise does not exist', async () => {
    vi.mocked(exerciseRepo.findExerciseById).mockResolvedValue(null)

    await expect(getExerciseById(99)).rejects.toThrow()
    expect(exerciseRepo.findExerciseById).toHaveBeenCalledWith(99)
  })
})