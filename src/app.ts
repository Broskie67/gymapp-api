import express, { Application, Request, Response } from 'express'
import authRoutes from './auth/auth.routes'
import { errorHandler } from './middlewares/error-handler'
import { getPool } from './db'

const app: Application = express()

app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!')
})

app.get('/health/db', async (_req: Request, res: Response, next) => {
  try {
    const pool = await getPool()
    const result = await pool.request().query('SELECT 1 AS ok')
    console.log('Success')
    res.json({ db: result.recordset[0] })
  } catch (error) {
    next(error)
  }
})

app.use('/auth', authRoutes)

app.use(errorHandler)

export default app