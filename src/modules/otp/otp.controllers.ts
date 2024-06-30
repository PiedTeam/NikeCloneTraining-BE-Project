import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { encrypt } from "~/utils/crypto";
import { generateOTP } from "~/utils/sendOtp";
import usersService from "../user/user.services";
import { OTP_KIND } from "./otp.enum";
import { OTP_MESSAGES } from "./otp.messages";
import { OtpMailReqBody, OtpPhoneReqBody } from "./otp.requests";
import otpService from "./otp.services";
// import { Twilio } from 'twilio'

//! Config Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioClient = new Twilio(accountSid, authToken)

// Generate OTP
let otp = null;

export const sendOtpPhoneNumberController = async (
    req: Request<ParamsDictionary, any, OtpPhoneReqBody>,
    res: Response,
) => {
    const { phone_number } = req.body as OtpPhoneReqBody;

    // need to check the current account was verified or not?
    //if verified we do not send OTP
    if (await usersService.checkPhoneNumberIsVerified(encrypt(phone_number))) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: OTP_MESSAGES.PHONE_NUMBER_WAS_VERIFIED,
        });
    }

    otp = generateOTP();

    console.log("Otp Phone: " + otp);

    //* Nhét thêm otp vào req.body
    await otpService.sendPhone({
        phone_number,
        otp,
        kind: OTP_KIND.VerifyAccount,
    });

    // Send OTP to phone number
    return res.status(StatusCodes.OK).json({
        message: OTP_MESSAGES.SEND_OTP_SUCCESSFULLY,
    });
};

export const sendOtpMailController = async (
    req: Request<ParamsDictionary, any, OtpMailReqBody>,
    res: Response,
) => {
    const { email } = req.body as OtpMailReqBody;

    // need to check the current account was verified or not?
    //if verified we do not send OTP
    if (await usersService.checkEmailIsVerified(encrypt(email))) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: OTP_MESSAGES.EMAIL_WAS_VERIFIED,
        });
    }

    otp = generateOTP();

    console.log("Otp Phone: " + otp);

    //* Nhét thêm otp vào req.body
    await otpService.sendEmail({
        email,
        otp,
        kind: OTP_KIND.VerifyAccount,
    });

    // Send OTP to phone number
    return res.status(HTTP_STATUS.OK).json({
        message: OTP_MESSAGES.SEND_OTP_SUCCESSFULLY,
    });
};
