export type UserProfile = {
    id: number
    username: string
    email: string
    createdAt: Date
    updatedAt: Date
}

export type UpdatedUserDto = {
    username?: string
    email?: string
}