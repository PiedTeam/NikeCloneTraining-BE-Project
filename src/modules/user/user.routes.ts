import { Router } from 'express'
import {
    forgotPasswordController,
    getMeController,
    loginController,
    registerController,
    resetPasswordController,
    sendVerifyAccountOTPController,
    verifyAccountController,
    verifyForgotPasswordTokenController
} from './user.controllers'
import {
    accessTokenValidator,
    blockPostman,
    checkEmailOrPhone,
    forgotPasswordValidator,
    loginCheckMissingField,
    loginValidator,
    registerValidator,
    resetPasswordValidator,
    verifyAccountOTPValidator,
    verifyAccountValidator,
    verifyForgotPasswordOTPValidator
} from './user.middlewares'
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
    blockPostman,
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
    blockPostman,
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
    blockPostman,
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
    blockPostman,
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
    blockPostman,
    resetPasswordValidator,
    checkEmailOrPhone,
    verifyForgotPasswordOTPValidator,
    wrapAsync(resetPasswordController)
)

/*
  description: send otp verify account to user's email or phone number
  path: /users/verify-account
  method: POST
  body: { email_phone: string }
*/
usersRouter.post(
    '/send-verify-account-otp',
    blockPostman,
    checkEmailOrPhone,
    verifyAccountValidator,
    wrapAsync(sendVerifyAccountOTPController)
)

/*
  description: verify account
  path: /users/verify-account
  method: POST
  body: { email_phone: string, verify_account_otp: string }
*/
usersRouter.post(
    '/verify-account',
    blockPostman,
    checkEmailOrPhone,
    verifyAccountValidator,
    verifyAccountOTPValidator,
    wrapAsync(verifyAccountController)
)

/*
des: get user's profile
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

export default usersRouter
