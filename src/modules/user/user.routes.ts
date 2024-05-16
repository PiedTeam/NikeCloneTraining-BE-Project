import { Router } from 'express'
import {
    forgotPasswordController,
    getMeController,
    loginController,
    registerController,
    resetPasswordController,
    sendVerifyAccountOTPController,
    updateMeController,
    verifyAccountController,
    verifyForgotPasswordTokenController
} from './user.controllers'
import {
    accessTokenValidator,
    checkEmailOrPhone,
    forgotPasswordValidator,
    loginValidator,
    registerValidator,
    resetPasswordValidator,
    updateMeValidator,
    verifiedUserValidator,
    verifyAccountOTPValidator,
    verifyAccountValidator,
    verifyForgotPasswordOTPValidator
} from './user.middlewares'
import { wrapAsync } from '~/utils/handler'
import { limiter } from '~/config/limitRequest'
import express from 'express'
import { update } from 'lodash'

const app = express()
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
    limiter,
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
    limiter,
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

/*
  description: send otp verify account to user's email or phone number
  path: /users/verify-account
  method: POST
  body: { email_phone: string }
*/
usersRouter.post(
    '/send-verify-account-otp',
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

/*
  description: update user's profile
  path: '/me'
  method: patch
  header: {Authorization: Bearer <access_token>}
  body: { first_name: string, last_name: string, email: string, phone_number: string, ...}
*/
usersRouter.patch(
    '/me',
    accessTokenValidator,
    verifiedUserValidator,
    updateMeValidator,
    wrapAsync(updateMeController)
)
export default usersRouter
