import databaseService from '~/database/database.services'
import { StatusCodes } from 'http-status-codes'
import Otp from '../otp/otp.schema'
import { ErrorWithStatus } from '~/models/Error'
import { OTP_STATUS, OTP_TYPE } from './otp.enum'
import { OTP_MESSAGES } from './otp.messages'
import nodemailer from 'nodemailer'

class OtpService {
    async sendOtpPhone(payload: { phone_number: string; otp: string }) {
        const user = await databaseService.users.findOne({
            phone_number: payload.phone_number
        })

        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
            })
        }

        // lưu otp vào db
        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: payload.otp,
                type: OTP_TYPE.PhoneNumber,
                status: OTP_STATUS.Available
            })
        )

        return result
    }

    async sendEmail({ email, otp }: { email: string; otp: string }) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        // const user = await usersService.checkEmailExist(email)
        const user = await databaseService.users.findOne({ email })
        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
            })
        }

        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: otp,
                type: OTP_TYPE.Email,
                status: OTP_STATUS.Available
            })
        )

        await transporter.sendMail(
            {
                from: `${process.env.EMAIL_USER}`,
                to: `${email}`,
                subject: '[NIKE] Please Verify Your Email By OTP 🔑 🎉',
                html: `Sent from your Nike verify account - Your OTP is: ${otp}`
            },
            (error) => {
                if (error) {
                    console.log(error)
                    throw new Error('Error sending email')
                }
            }
        )

        return result
    }
}

const otpService = new OtpService()
export default otpService
