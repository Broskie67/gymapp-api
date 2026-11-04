import express, { Application, Request, Response, NextFunction } from 'express'
import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import exerciseRoutes from './modules/exercises/exercises.routes'
import { errorHandler } from './middlewares/error-handler'
import { query } from './db'

const app: Application = express()

app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!')
})

app.get('/health/db', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [row] = await query('SELECT 1 AS ok')
    res.json({ db: row})
  } catch (error) {
    next(error)
  }
})

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/exercises', exerciseRoutes)

app.use(errorHandler)

export default app