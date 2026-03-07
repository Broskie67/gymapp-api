export async function findUserByEmail(email: string) {}

export async function createUser(data: {
    username: string
    email: string
    passwordHash: string
}) {}

export async function findUserById(userId: number) {}

export async function storeRefreshToken(userId: number, refreshToken: string) {}

export async function findRefreshToken(refreshToken: string) {}

export async function revokeRefreshToken(refreshToken: string) {}