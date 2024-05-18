import databaseService from '~/database/database.services'
import { StatusCodes } from 'http-status-codes'
import Otp from '../otp/otp.schema'
import { ErrorWithStatus } from '~/models/Error'
import { OTP_KIND, OTP_STATUS, OTP_TYPE } from './otp.enum'
import { OTP_MESSAGES } from './otp.messages'
import nodemailer from 'nodemailer'
import { encrypt } from '~/utils/crypto'
import { ObjectId } from 'mongodb'
import { sendOtpMail, sendOtpPhone } from '~/utils/sendOtp'

class OtpService {
    async checkExistOtp(user_id: ObjectId) {
        const exsitOtp = await databaseService.OTP.findOne({
            user_id,
            status: OTP_STATUS.Available
        })

        if (exsitOtp) {
            await databaseService.OTP.updateOne(
                {
                    _id: exsitOtp._id
                },
                { $set: { status: OTP_STATUS.Unavailable } }
            )
        }

        return true
    }
    async sendPhone(payload: { phone_number: string; otp: string; kind: OTP_KIND }) {
        const { phone_number, otp, kind } = payload

        const user = await databaseService.users.findOne({
            phone_number: encrypt(payload.phone_number)
        })

        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
            })
        }
        await this.checkExistOtp(user._id)
        // lưu otp vào db
        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: payload.otp,
                type: OTP_TYPE.PhoneNumber,
                status: OTP_STATUS.Available
            })
        )

        await sendOtpPhone({
            kind,
            otp,
            phone_number,
            username: user.first_name.length ? user.first_name : user.last_name
        })

        return result
    }

    async sendEmail(payload: { email: string; otp: string; kind: OTP_KIND }) {
        const { email, otp, kind } = payload
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        // const user = await usersService.checkEmailExist(email)
        const user = await databaseService.users.findOne({
            email: encrypt(email)
        })
        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
            })
        }

        await this.checkExistOtp(user._id)

        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: otp,
                type: OTP_TYPE.Email,
                status: OTP_STATUS.Available
            })
        )
        const username = user.first_name.length ? user.first_name : user.last_name
        await sendOtpMail({ kind, otp, email, username: username })

        return result
    }
}

const otpService = new OtpService()
export default otpService
