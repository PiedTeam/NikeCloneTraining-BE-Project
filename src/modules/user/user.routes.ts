import { Router } from 'express'
import { registerController } from './user.contrtollers'
import { registerValidator } from './user.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapAsync(registerController))

export default usersRouter
