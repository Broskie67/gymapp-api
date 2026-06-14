export type Exercise = {
  id: number
  name: string
  muscleGroup: string | null
  exerciseType: string | null
  equipment: string | null
  createdAt: Date
  updatedAt: Date
}

export type ExerciseSummary = {
  id: number
  name: string
  muscleGroup: string | null
}

export type ExerciseFilters = {
  muscleGroup?: string
  exerciseType?: string
  equipment?: string
}
