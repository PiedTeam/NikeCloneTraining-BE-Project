import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import otpGenerator from 'otp-generator'
import otpService from './otp.services'
import { OTP_MESSAGES } from './otp.messages'
import { SendOtpViaMailReqBody, SendOtpViaPhoneReqBody } from './otp.requests'
import { OTP_KIND } from './otp.enum'

//! Config Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
// const twilioClient = new Twilio(accountSid, authToken)

export const sendOtpPhoneNumberController = async (
    req: Request<ParamsDictionary, any, SendOtpViaPhoneReqBody>,
    res: Response
) => {
    const { phone_number } = req.body
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
        message: OTP_MESSAGES.SEND_OTP_PHONE_SUCCESS,
        OTP: otp,
        result
    })
}

export const sendOtpMailController = async (
    req: Request<ParamsDictionary, any, SendOtpViaMailReqBody>,
    res: Response
) => {
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })
    //* Nhét thêm otp vào req.body
    const result = await otpService.sendEmail({
        email: req.body.email,
        otp,
        kind: OTP_KIND.VerifyAccount
    })

    // Send OTP to phone number
    return res.status(StatusCodes.OK).json({
        message: OTP_MESSAGES.SEND_OTP_MAIL_SUCCESS,
        OTP: otp,
        result
    })
}
