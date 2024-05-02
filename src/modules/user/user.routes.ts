import { Router } from 'express'
import {
    forgotPasswordController,
    loginController,
    registerController
} from './user.controllers'
import {
    checkEmailOrPhone,
    forgotPasswordValidator,
    loginCheckMissingField,
    loginValidator,
    registerValidator,
    verifyForgotPasswordTokenValidator
} from './user.middlewares'
import { wrapAsync } from '~/utils/handler'
import { Request, Response } from 'express'

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

/*
  path: /user/forgot-password
  method: 'POST'
  body: { email_phone: string }
*/
usersRouter.post(
    '/forgot-password',
    checkEmailOrPhone,
    forgotPasswordValidator,
    wrapAsync(forgotPasswordController)
)

/*
  path: /users/reset-password
  method: 'POST'
  body: { forgot_password_token: string }
*/
usersRouter.post(
    '/verify-forgot-password',
    verifyForgotPasswordTokenValidator
    // wrapAsync(verifyForgotPasswordTokenController)
)

usersRouter.get('/login-success', (req: Request, res: Response) => {
    res.send('Welcome to Nike Clone Training Project')
})

export default usersRouter
