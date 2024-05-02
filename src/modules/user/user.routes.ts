import { Router } from 'express'
import {
    forgotPasswordController,
    loginController,
    registerController,
    resetPasswordController,
    verifyForgotPasswordTokenController
} from './user.controllers'
import {
    checkEmailOrPhone,
    forgotPasswordValidator,
    loginCheckMissingField,
    loginValidator,
    registerValidator,
    resetPasswordValidator,
    verifyForgotPasswordOTPValidator
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
  description: send otp forgot password to user's email or phone number
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
description: verify otp
  path: /users/reset-password
  method: 'POST'
  body: { 
          email_phone: string, 
          forgot_password_otp: string 
        }
*/
usersRouter.post(
    '/verify-otp',
    checkEmailOrPhone,
    verifyForgotPasswordOTPValidator,
    wrapAsync(verifyForgotPasswordTokenController)
)

/*
des: reset password
path: '/reset-password'
method: POST
body: { 
        email_phone: string,
        forgot_password_otp: string,
        confirm_password: string, 
        password: string
      }
*/
usersRouter.post(
    '/reset-password',
    resetPasswordValidator,
    checkEmailOrPhone,
    verifyForgotPasswordOTPValidator,
    wrapAsync(resetPasswordController)
)

export default usersRouter
