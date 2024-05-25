import express, { Router } from 'express'
import { update } from 'lodash'
import { limiter } from '~/config/limitRequest'
import { HTTP_STATUS } from '~/constants/httpStatus'
import decrypt, { encrypt } from '~/utils/crypto'
import { wrapAsync } from '~/utils/handler'
import {
    changePasswordController,
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
    changePasswordValidator,
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
import usersService from './user.services'

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
//     searchAccountValidator,
//     wrapAsync(searchAccountController)
// )
type UserResponseEmail = {
    email: string
    type: 'email'
}

type UserResponsePhone = {
    phone_number: string
    type: 'phone_number'
}

type UserResponseSearch = UserResponseEmail | UserResponsePhone

usersRouter.post('/search', checkEmailOrPhone, async (req, res) => {
    const data = req.body as UserResponseSearch

    let result = false
    let user

    if (data.type === 'email') {
        if (await usersService.checkEmailExist(encrypt(data.email))) {
            result = true
            user = await usersService.findUserByEmail(encrypt(data.email))
        }
    } else {
        if (
            await usersService.checkPhoneNumberExist(encrypt(data.phone_number))
        ) {
            result = true
            user = await usersService.findUserByPhone(
                encrypt(data.phone_number)
            )
        }
    }

    if (result) {
        res.status(HTTP_STATUS.OK).json({
            isExist: result,
            data: user
        })
    } else {
        res.status(HTTP_STATUS.NOT_FOUND).json({
            isExist: result
        })
    }
})

export default usersRouter
