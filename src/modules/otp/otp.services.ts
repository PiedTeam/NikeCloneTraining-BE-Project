import databaseService from "~/database/database.services";
import { StatusCodes } from "http-status-codes";
import Otp from "../otp/otp.schema";
import { ErrorWithStatus } from "~/errors/errors.entityError";
import { OTP_KIND, OTP_STATUS, OTP_TYPE } from "./otp.enum";
import { OTP_MESSAGES } from "./otp.messages";
import nodemailer from "nodemailer";
import { encrypt } from "~/utils/crypto";
import { ObjectId } from "mongodb";
import { sendOtpMail, sendOtpPhone } from "~/utils/sendOtp";
import { NoticeUser } from "../user/user.enum";
import moment from "moment";
import usersService from "../user/user.services";

class OtpService {
    isOTPExpired(otp: Otp) {
        const timeNow = moment();
        const duration = moment.duration(timeNow.diff(otp.created_at));
        const minutes = duration.asMinutes();
        console.log(minutes);
        return minutes > Number(process.env.OTP_EXPIRED_TIME);
    }
    async checkExistOtp(user_id: ObjectId) {
        const exsitOtp = await databaseService.OTP.findOne({
            user_id,
            status: OTP_STATUS.Available,
        });

        if (exsitOtp) {
            await databaseService.OTP.updateOne(
                {
                    _id: exsitOtp._id,
                    status: OTP_STATUS.Available,
                },
                { $set: { status: OTP_STATUS.Unavailable } },
            );
            return exsitOtp.incorrTimes;
        }
        return 0;
    }
    async checkLimit(user_id: ObjectId, type: OTP_TYPE) {
        const exsitUser = await databaseService.OTP.findOne({
            user_id,
            type,
        });
        if (!exsitUser) {
            console.log("lỗi 0");
            return true;
        }
        const timeNow = new Date();
        const lim = await databaseService.OTP.aggregate([
            { $match: { user_id, type } },
            { $group: { _id: user_id, count: { $sum: 1 } } },
        ]).toArray();
        if (
            timeNow.getTime() - exsitUser.created_at.getTime() >=
            Number(process.env.TIMETORESET)
        ) {
            await databaseService.OTP.deleteOne({
                user_id: exsitUser,
            });
            return true;
        }
        if (lim[0].count == 3) {
            const total = await databaseService.OTP.aggregate([
                { $match: { user_id } },
                { $group: { _id: user_id, count: { $sum: 1 } } },
            ]).toArray();
            if (total[0].count == 6) {
                const isWarning = await usersService.isWarning(user_id);
                if (isWarning) {
                    await databaseService.users.updateOne(
                        {
                            _id: user_id,
                        },
                        { $set: { notice: NoticeUser.Banned } },
                    );
                    console.log("lỗi 3");
                    throw new ErrorWithStatus({
                        message: OTP_MESSAGES.ACCOUNT_IS_BANNED,
                        status: StatusCodes.NOT_ACCEPTABLE,
                    });
                }

                await databaseService.users.updateOne(
                    { _id: user_id },
                    { $set: { notice: NoticeUser.Warning } },
                );
                throw new ErrorWithStatus({
                    message: OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME,
                    status: StatusCodes.NOT_ACCEPTABLE,
                });
            }
            console.log("lỗi 2");
            throw new ErrorWithStatus({
                message: `${OTP_MESSAGES.CAN_NOT_SEND_OTP_BY} ${OTP_TYPE[type]}`,
                status: StatusCodes.NOT_ACCEPTABLE,
            });
        }

        // for (const i of lim) {
        //     if (i.count >= 3) {
        //         const total = await databaseService.OTP.aggregate([
        //             { $match: { user_id } },
        //             { $group: { _id: user_id, count: { $sum: 1 } } }
        //         ]).toArray()
        //         if (total[0].count == 6) {
        //             await databaseService.users.updateOne(
        //                 { _id: user_id },
        //                 { $set: { notice: NoticeUser.Warning } }
        //             )
        //             throw new ErrorWithStatus({
        //                 message: OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME,
        //                 status: StatusCodes.NOT_ACCEPTABLE
        //             })
        //         }
        //         // otpLimiter
        //         if (exsitUser.created_at !== undefined) {
        //             if (
        //                 -exsitUser.created_at.getTime() +
        //                     timeNow.getTime() <=
        //                 Number(process.env.TIMETORESET)
        //             ) {
        //                 throw new ErrorWithStatus({
        //                     message: `${OTP_MESSAGES.CAN_NOT_SEND_OTP_BY} ${type}`,
        //                     status: StatusCodes.BAD_REQUEST
        //                 })
        //             }
        //             await databaseService.OTP.deleteMany({
        //                 user_id: exsitUser
        //             })
        //         }
        //         throw new ErrorWithStatus({
        //             message: OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME,
        //             status: StatusCodes.NOT_ACCEPTABLE
        //         })
        //     }
        //     if (exsitUser.created_at !== undefined) {
        //         if (
        //             -exsitUser.created_at.getTime() + timeNow.getTime() >
        //             Number(process.env.TIMETORESET)
        //         ) {
        //             await databaseService.OTP.deleteMany({
        //                 user_id: exsitUser
        //             })
        //         }
        //     }
        //     // if (lim === 3) {
        //     //     otpLimiter
        //     //     throw new ErrorWithStatus({
        //     //         message: OTP_MESSAGES.SEND_OTP_OVER_LIMIT_TIME,
        //     //         status: StatusCodes.NOT_ACCEPTABLE
        //     //     })
        //     // }
        // }
        console.log("lỗi 1");
        return true;
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
        phone_number: string;
        otp: string;
        kind: OTP_KIND;
    }) {
        const { phone_number, otp, kind } = payload;

        const user = await databaseService.users.findOne({
            phone_number: encrypt(payload.phone_number),
        });

        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND,
            });
        }
        const incorrTimes = await this.checkExistOtp(user._id);
        await this.checkLimit(user._id, OTP_TYPE.PhoneNumber);
        // lưu otp vào db
        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: payload.otp,
                type: OTP_TYPE.PhoneNumber,
                status: OTP_STATUS.Available,
                incorrTimes: incorrTimes,
                created_at: new Date(),
                expired_at: new Date(),
            }),
        );

        await sendOtpPhone({
            kind,
            otp,
            phone_number,
            username: user.first_name.length ? user.first_name : user.last_name,
        });

        return result;
    }

    async sendEmail(payload: { email: string; otp: string; kind: OTP_KIND }) {
        const { email, otp, kind } = payload;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // const user = await usersService.checkEmailExist(email)
        const user = await databaseService.users.findOne({
            email: encrypt(email),
        });
        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND,
            });
        }

        const incorrTimes = await this.checkExistOtp(user._id);
        await this.checkLimit(user._id, OTP_TYPE.Email);

        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: otp,
                type: OTP_TYPE.Email,
                status: OTP_STATUS.Available,
                incorrTimes: incorrTimes,
                created_at: new Date(),
                expired_at: new Date(),
            }),
        );
        const username = user.first_name.length
            ? user.first_name
            : user.last_name;
        await sendOtpMail({ kind, otp, email, username: username });

        return result;
    }
}

const otpService = new OtpService();
export default otpService;
