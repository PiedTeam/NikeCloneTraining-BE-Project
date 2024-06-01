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
import { UserVerifyStatus } from '../user/user.enum'

class OtpService {
    async checkExistOtp(user_id: ObjectId) {
        const exsitOtp = await databaseService.OTP.findOne({
            user_id,
            status: OTP_STATUS.Available
        })

        if (exsitOtp) {
            await databaseService.OTP.updateOne(
                {
                    _id: exsitOtp._id,
                    status: OTP_STATUS.Available
                },
                { $set: { status: OTP_STATUS.Unavailable } }
            )
            return exsitOtp.incorrTimes
        }
        return 0
    }
    async checkLimit(user_id: ObjectId, type: OTP_TYPE) {
        const exsitUser = await databaseService.OTP.findOne({
            user_id
        })
        if (exsitUser) {
            const timeNow = new Date()
            const lim = await databaseService.OTP.aggregate([
                { $match: { user_id, type } },
                { $group: { _id: user_id, count: { $sum: 1 } } }
            ]).toArray()

            for (const i of lim) {
                if (i.count >= 3) {
                    // otpLimiter
                    if (exsitUser.created_at !== undefined) {
                        if (
                            -exsitUser.created_at.getTime() +
                                timeNow.getTime() <=
                            Number(process.env.TIMETORESET)
                        ) {
                            await databaseService.users.updateOne(
                                { _id: user_id },
                                { $set: { status: UserVerifyStatus.Warning } }
                            )
                            throw new ErrorWithStatus({
                                message: OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME,
                                status: StatusCodes.BAD_REQUEST
                            })
                        }
                        await databaseService.OTP.deleteMany({
                            user_id: exsitUser
                        })
                    }
                    throw new ErrorWithStatus({
                        message: OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME,
                        status: StatusCodes.NOT_ACCEPTABLE
                    })
                }
                if (exsitUser.created_at !== undefined) {
                    if (
                        -exsitUser.created_at.getTime() + timeNow.getTime() >
                        Number(process.env.TIMETORESET)
                    ) {
                        await databaseService.OTP.deleteMany({
                            user_id: exsitUser
                        })
                    }
                }
                // if (lim === 3) {
                //     otpLimiter
                //     throw new ErrorWithStatus({
                //         message: OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME,
                //         status: StatusCodes.NOT_ACCEPTABLE
                //     })
                // }
            }
            return true
        }
    }
    // async checkLimitOtp(user_id: ObjectId) {
    //     const limit = await databaseService.OTP.findOne({
    //         user_id,
    //         otpLimit: { $gte: 0, $lte: 3 }
    //     })
    //     const timeNow = new Date()
    //     if (limit?.created_at !== undefined) {
    //         if (
    //             limit.created_at.getTime() - timeNow.getTime() >=
    //             Number(process.env.TIMETORESET)
    //         ) {
    //             throw new Error(OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME)
    //         }
    //     }
    //     if (!limit) {
    //         await databaseService.OTP.updateOne(
    //             {
    //                 _id: user_id
    //             },
    //             { $set: { otpLimit: 1 } }
    //         )
    //         return 1
    //     } else {
    //         await databaseService.OTP.updateOne(
    //             {
    //                 _id: limit._id
    //             },
    //             {
    //                 $inc: { otpLimit: 1 }
    //             }
    //         )
    //     }
    //     return limit.otpLimit
    // }
    // async blockLimit(lim: number) {
    //     if (lim > 3) {
    //         throw new Error(OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME)
    //     }
    //     return true
    // }
    async sendPhone(payload: {
        phone_number: string
        otp: string
        kind: OTP_KIND
    }) {
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
        const incorrTimes = await this.checkExistOtp(user._id)
        await this.checkLimit(user._id, OTP_TYPE.PhoneNumber)
        // lưu otp vào db
        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: payload.otp,
                type: OTP_TYPE.PhoneNumber,
                status: OTP_STATUS.Available,
                incorrTimes: incorrTimes
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

        const incorrTimes = await this.checkExistOtp(user._id)
        await this.checkLimit(user._id, OTP_TYPE.Email)

        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: otp,
                type: OTP_TYPE.Email,
                status: OTP_STATUS.Available,
                incorrTimes: incorrTimes
            })
        )
        const username = user.first_name.length
            ? user.first_name
            : user.last_name
        await sendOtpMail({ kind, otp, email, username: username })

        return result
    }
}

const otpService = new OtpService()
export default otpService
