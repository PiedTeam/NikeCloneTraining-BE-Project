import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import otpGenerator from 'otp-generator'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { encrypt } from '~/utils/crypto'
import usersService from '../user/user.services'
import { OTP_KIND } from './otp.enum'
import { OTP_MESSAGES } from './otp.messages'
import { SendOtpViaMailReqBody, SendOtpViaPhoneReqBody } from './otp.requests'
import otpService from './otp.services'
// import { Twilio } from 'twilio'

//! Config Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
// const twilioClient = new Twilio(accountSid, authToken)

export const sendOtpPhoneNumberController = async (
    req: Request<ParamsDictionary, any, SendOtpViaPhoneReqBody>,
    res: Response
) => {
    const { phone_number } = req.body

    // need to check the current account was verified or not?
    //if verified we do not send OTP
    if (await usersService.checkPhoneNumberIsVerified(encrypt(phone_number))) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: OTP_MESSAGES.PHONE_NUMBER_WAS_VERIFIED
        })
    }

    //else send OTP
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })

    //* Nhét thêm otp vào req.body
    const result = await otpService.sendPhone({
        phone_number,
        otp,
        kind: OTP_KIND.VerifyAccount
    })

    // Send OTP to phone number
    return res.status(StatusCodes.OK).json({
        message: OTP_MESSAGES.SEND_OTP_SUCCESSFULLY
    })
}

export const sendOtpMailController = async (
    req: Request<ParamsDictionary, any, SendOtpViaMailReqBody>,
    res: Response
) => {
    const { email } = req.body

    // need to check the current account was verified or not?
    //if verified we do not send OTP
    if (await usersService.checkEmailIsVerified(encrypt(email))) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: OTP_MESSAGES.EMAIL_WAS_VERIFIED
        })
    }

    //else send OTP
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })
    //* Nhét thêm otp vào req.body
    const result = await otpService.sendEmail({
        email,
        otp,
        kind: OTP_KIND.VerifyAccount
    })

    // Send OTP to phone number
    return res.status(StatusCodes.OK).json({
        message: OTP_MESSAGES.SEND_OTP_SUCCESSFULLY
    })
}
