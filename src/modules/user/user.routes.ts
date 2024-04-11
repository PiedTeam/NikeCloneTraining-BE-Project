import { Router } from 'express'
import { registerController } from './user.contrtollers'
import { registerValidator } from './user.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = Router()

/*
  route: register by username
  path: user/register
  method: POST
  body: {
    username: string,
    password: string,
    email: string,
    phone_number: string,
    first_name: string,
    last_name: string
  }
*/
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

export default usersRouter
