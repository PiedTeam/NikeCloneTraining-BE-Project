import { Router } from 'express'
import {
    checkEmailOrPhone,
    loginCheckMissingField,
    loginValidator,
    registerValidator
} from './user.middlewares'
import { loginController, registerController } from './user.controllers'
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
usersRouter.post(
    '/register',
    checkEmailOrPhone,
    registerValidator,
    wrapAsync(registerController)
)

/*
route: login
path: user/login
method: POST
body: {
  username?: string,
  email?: string,
  phone_number?: string,
  password: string
}
*/
usersRouter.post(
    '/login',
    // loginCheckMissingField,
    checkEmailOrPhone,
    loginValidator,
    wrapAsync(loginController)
)

export default usersRouter
