import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getExercises, getExerciseById } from './exercises.controller'
import * as exerciseService from './exercises.service'
import { Request, Response, NextFunction } from 'express'

vi.mock('./exercises.service', () => ({
  getExercises: vi.fn(),
  getExerciseById: vi.fn(),
}))

vi.mock('../../utils/formatErrorResponse', () => ({
  formatSuccessResponse: vi.fn((status, message, data) => ({ status, message, data })),
}))

const mockRes = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
} as unknown as Response

const mockNext = vi.fn() as NextFunction

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getExercises', () => {
  it('should return a list of exercises with 200', async () => {
    const mockExercises = [
      { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest' },
      { id: 2, name: 'Barbell Curl', muscleGroup: 'Arms' },
    ]

    vi.mocked(exerciseService.getExercises).mockResolvedValue(mockExercises)

    const mockReq = { originalUrl: '/exercises' } as Request

    await getExercises(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 200,
      message: 'success',
      data: mockExercises,
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should call next on error', async () => {
    const error = new Error('DB error')
    vi.mocked(exerciseService.getExercises).mockRejectedValue(error)

    const mockReq = { originalUrl: '/exercises' } as Request

    await getExercises(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledWith(error)
    expect(mockRes.json).not.toHaveBeenCalled()
  })
})

describe('getExerciseById', () => {
  it('should return an exercise with 200', async () => {
    const now = new Date()
    const mockExercise = {
      id: 1,
      name: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      exerciseType: 'Compound',
      equipment: 'Barbell',
      createdAt: now,
      updatedAt: now,
    }

    vi.mocked(exerciseService.getExerciseById).mockResolvedValue(mockExercise)

    const mockReq = {
      params: { id: '1' },
      originalUrl: '/exercises/1',
    } as unknown as Request<{ id: string }>

    await getExerciseById(mockReq, mockRes, mockNext)

    expect(exerciseService.getExerciseById).toHaveBeenCalledWith(1)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 200,
      message: 'exercise retrieved succesfully',
      data: mockExercise,
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should call next when exercise is not found', async () => {
    const error = new Error('Not found')
    vi.mocked(exerciseService.getExerciseById).mockRejectedValue(error)

    const mockReq = {
      params: { id: '99' },
      originalUrl: '/exercises/99',
    } as unknown as Request<{ id: string }>

    await getExerciseById(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledWith(error)
    expect(mockRes.json).not.toHaveBeenCalled()
  })
})