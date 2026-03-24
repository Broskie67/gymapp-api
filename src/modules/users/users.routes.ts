import { Router } from 'express'
import * as userController from './users.controller'
import { authenticate } from '../../middlewares/authenticate'
import { validateUpdateProfile, validateUpdatePassword } from './users.validation'

const router = Router()

router.get('/me', authenticate, userController.getProfile)
router.patch('/me', authenticate, validateUpdateProfile, userController.updateProfile)
router.patch('/me/password', authenticate, validateUpdatePassword, userController.updatePassword)

export default router