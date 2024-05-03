import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import {
    sendOtpMailController,
    sendOtpPhoneNumberController
} from './otp.controllers'
import { emailValidator, phoneNumberValidator } from './otp.middlewares'
import { verify } from 'crypto'
import { blockPostman } from '../user/user.middlewares'

const otpRouter = Router()

/*
  Description: send OTP via phone number
  Path: otp/send-otp-phone
  Method: POST
  Body: {
    phone_number: string
  }
*/
otpRouter.post(
    '/send-otp-phone',
    blockPostman,
    phoneNumberValidator,
    wrapAsync(sendOtpPhoneNumberController)
)

/*
  Description: send OTP via mail
  Path: otp/send-otp-email
  Method: POST
  Body: {
    email: string
  }
*/
otpRouter.post(
    '/send-otp-email',
    blockPostman,
    emailValidator,
    wrapAsync(sendOtpMailController)
)

export default otpRouter
