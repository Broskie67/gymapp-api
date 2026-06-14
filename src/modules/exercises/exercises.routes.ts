import { Router } from 'express'
import * as exerciseController from './exercises.controller'
import { authenticate } from '../../middlewares/authenticate'


const router = Router()

router.get('/', authenticate, exerciseController.getExercises)
router.get('/:id', authenticate, exerciseController.getExerciseById)

export default router