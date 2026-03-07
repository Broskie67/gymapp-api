export type RegisterDto = {
    email: string
    password: string
    username: string
}

export type LoginDto = {
    email: string
    password: string
}

export type RefreshDto = {
    refreshToken: string
}

export type JwtPayload = {
    userId: string
    email: string
}

export type AuthUser = {
    id: string
    email: string
    username: string
}

export type AuthTokens = {
    accessToken: string
    refreshToken: string
}