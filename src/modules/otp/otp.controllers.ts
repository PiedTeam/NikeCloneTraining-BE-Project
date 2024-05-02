import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import otpGenerator from 'otp-generator'
import otpService from './otp.services'
import { OTP_MESSAGES } from './otp.messages'
import { SendOtpViaMailReqBody, SendOtpViaPhoneReqBody } from './otp.requests'
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
    console.log('🚀 ~ phone_number:', phone_number)
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })

    //* Nhét thêm otp vào req.body
    const result = await otpService.sendOtpPhone({ phone_number, otp })

    // await twilioClient.messages.create({
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: '+84' + phone_number,
    //     body: `Sent from your Nike verify account - Your OTP is: ${otp}`
    // })

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
    const result = await otpService.sendEmail({ ...req.body, otp })

    // Send OTP to phone number
    return res.status(StatusCodes.OK).json({
        message: OTP_MESSAGES.SEND_OTP_MAIL_SUCCESS,
        OTP: otp,
        result
    })
}
