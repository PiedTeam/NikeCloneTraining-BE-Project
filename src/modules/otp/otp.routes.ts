import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator } from '../user/user.middlewares'
import { sendOtpMailController, sendOtpPhoneNumberController } from './otp.controllers'
import { emailValidator, phoneNumberValidator } from './otp.middlewares'

const otpRouter = Router()

/*
  Description: send OTP via phone number
  Path: otp/send-otp-phone
  Method: POST
  Header: { Authorization: Bearer <access_token> }
  Body: {
    phone_number: string
  }
*/
otpRouter.post('/send-otp-phone', accessTokenValidator, phoneNumberValidator, wrapAsync(sendOtpPhoneNumberController))

/*
  Description: send OTP via mail
  Path: otp/send-otp-email
  Method: POST
  Header: { Authorization: Bearer <access_token> }
  Body: {
    email: string
  }
*/
otpRouter.post('/send-otp-email', accessTokenValidator, emailValidator, wrapAsync(sendOtpMailController))

export default otpRouter
