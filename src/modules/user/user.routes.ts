import { Router } from 'express'
import { limiter } from '~/config/limitRequest'
import { wrapAsync } from '~/utils/handler'
import {
    changePasswordController,
    forgotPasswordController,
    getMeController,
    loginController,
    logoutController,
    registerController,
    resetPasswordController,
    searchAccountController,
    sendVerifyAccountOTPController,
    updateMeController,
    verifyAccountController,
    verifyForgotPasswordTokenController
} from './user.controllers'
import {
    accessTokenValidator,
    changePasswordValidator,
    checkEmailOrPhone,
    checkNewPasswordValidator,
    forgotPasswordValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    resetPasswordValidator,
    searchAccountValidator,
    updateMeValidator,
    verifiedUserValidator,
    verifyAccountOTPValidator,
    verifyAccountValidator,
    verifyForgotPasswordOTPValidator
} from './user.middlewares'
import { cronJobFake } from '~/utils/cronJobFake'

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
    wrapAsync(cronJobFake),
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
}/register
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
    // limiter,
    checkEmailOrPhone,
    forgotPasswordValidator,
    wrapAsync(forgotPasswordController)
)

/*
  description: verify otp
  path: /users/verify-password
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
        password: string,
        confirm_password: string
      }
*/
usersRouter.post(
    '/reset-password',
    resetPasswordValidator,
    checkEmailOrPhone,
    verifyForgotPasswordOTPValidator,
    checkNewPasswordValidator,
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
des: change password
path: '/change-password'
method: post
Header: {Authorization: Bearer <access_token>}
body: { old_password: string, new_password: string }
*/
usersRouter.post(
    '/change-password',
    accessTokenValidator,
    changePasswordValidator,
    wrapAsync(changePasswordController)
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

/*
 description: search API account
 path: /users/search
  method: GET
  header: {Authorization: Bearer <access_token>}
  body: {email_phone: string}
*/
// usersRouter.post(
//     '/search',
//     accessTokenValidator,
//     checkEmailOrPhone,
//     searchAccountValidator,
//     wrapAsync(searchAccountController)
// )

usersRouter.post(
    '/search',
    accessTokenValidator,
    checkEmailOrPhone,
    searchAccountValidator,
    wrapAsync(searchAccountController)
)

usersRouter.post(
    '/logout',
    accessTokenValidator,
    refreshTokenValidator,
    wrapAsync(logoutController)
)

export default usersRouter
