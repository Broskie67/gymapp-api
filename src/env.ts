import dotenv from 'dotenv'

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is missing in env file`)
  }
  return value
}

export const env = {
  URL: process.env.URL ?? 'http://localhost',
  HOST: process.env.HOST ?? 'localhost',
  PORT: Number(process.env.PORT ?? 3000),

  SA_USER: getRequiredEnv('SA_USER'),
  SA_PASSWORD: getRequiredEnv('SA_PASSWORD'),
  SQLSERVER_SERVER: getRequiredEnv('SQLSERVER_SERVER'),
  SQLSERVER_DATABASE: getRequiredEnv('SQLSERVER_DATABASE'),
  SQLSERVER_PORT: Number(process.env.SQLSERVER_PORT ?? 1433),
} as const