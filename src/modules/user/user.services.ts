import databaseService from '~/database/database.services'
import User from './user.schema'
import { ObjectId } from 'mongodb'
import {
    RegisterOauthReqBody,
    RegisterReqBody,
    UpdateMeReqBody
} from './user.requests'
import { encrypt, hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from './user.enum'
import RefreshToken from '../refreshToken/refreshToken.schema'
import { omit } from 'lodash'
import otpGenerator from 'otp-generator'
import otpService from '../otp/otp.services'
import { OTP_KIND } from '../otp/otp.enum'
import { capitalize } from 'lodash'
import { capitalizePro } from '~/utils/capitalize'
import 'dotenv/config'

class UsersService {
    private decodeRefreshToken(refresh_token: string) {
        return verifyToken({
            token: refresh_token,
            secretOrPublickey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })
    }

    private signAccessToken(user_id: string, status: UserVerifyStatus) {
        return signToken({
            payload: { user_id: user_id, token_type: TokenType.Access, status },
            options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
        })
    }

    private signRefreshToken(user_id: string, status: UserVerifyStatus) {
        return signToken({
            payload: {
                user_id: user_id,
                token_type: TokenType.Refresh,
                status
            },
            options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_DAYS },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })
    }

    private signAccessAndRefreshToken(
        user_id: string,
        status: UserVerifyStatus
    ) {
        return Promise.all([
            this.signAccessToken(user_id, status),
            this.signRefreshToken(user_id, status)
        ])
    }

    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }

    // async checkUsernameExist(username: string) {
    //     const user = await databaseService.users.findOne({ username })
    //     return Boolean(user)
    // }

    async checkPhoneNumberExist(phone_number: string) {
        const user = await databaseService.users.findOne({ phone_number })
        return Boolean(user)
    }

    async checkPasswordExist(password: string) {
        password = hashPassword(password)
        const user = await databaseService.users.findOne({ password })
        return Boolean(user)
    }

    async getme(user_id: string) {
        const user = await databaseService.users.findOne(
            { _id: new ObjectId(user_id) },
            {
                projection: {
                    password: 0
                }
            }
        )
        return user as User
    }

    async register(
        payload: RegisterReqBody | RegisterOauthReqBody,
        provider?: string
    ) {
        const user_id = new ObjectId()

        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(
                user_id.toString(),
                UserVerifyStatus.Unverified
            )

        const { iat, exp } = await this.decodeRefreshToken(refresh_token)

        if (provider === 'google' || provider === 'facebook') {
            await databaseService.users.insertOne(
                new User({
                    _id: user_id,
                    ...(omit(payload, [
                        'phone_number'
                    ]) as RegisterOauthReqBody),
                    password: hashPassword(payload.password),
                    email: encrypt(payload.email)
                })
            )
        } else {
            await databaseService.users.insertOne(
                new User({
                    _id: user_id,
                    ...(omit(payload, ['email_phone']) as RegisterReqBody),
                    password: hashPassword(payload.password),
                    // username:
                    //     capitalize(payload.first_name) +
                    //     ' ' +
                    //     capitalizePro(payload.last_name),
                    first_name: capitalize(payload.first_name),
                    last_name: capitalizePro(payload.last_name),
                    email: payload.email?.length ? encrypt(payload.email) : '',
                    phone_number: payload.phone_number?.length
                        ? encrypt(payload.phone_number)
                        : ''
                })
            )
        }

        await databaseService.refreshTokens.insertOne(
            new RefreshToken({
                token: refresh_token,
                user_id: new ObjectId(user_id),
                iat,
                exp
            })
        )

        return { access_token, refresh_token }
    }

    async login({
        user_id,
        status
    }: {
        user_id: string
        status: UserVerifyStatus
    }) {
        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(user_id, status)

        const { iat, exp } = await this.decodeRefreshToken(refresh_token)

        await databaseService.refreshTokens.insertOne(
            new RefreshToken({
                token: refresh_token,
                user_id: new ObjectId(user_id),
                iat,
                exp
            })
        )

        return { access_token, refresh_token }
    }

    async sendForgotPasswordOTPByEmail(email: string) {
        // send otp to email
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const result = await otpService.sendEmail({
            email,
            otp,
            kind: OTP_KIND.PasswordRecovery
        })

        return { otp_id: result.insertedId, otp: otp }
    }

    async sendForgotPasswordOTPByPhone(phone_number: string) {
        // send otp to phone
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const result = await otpService.sendPhone({
            phone_number,
            otp,
            kind: OTP_KIND.PasswordRecovery
        })

        return { otp_id: result.insertedId, otp: otp }
    }

    async sendVerifyAccountOTPByEmail(email: string) {
        // send otp to email
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const result = await otpService.sendEmail({
            email,
            otp,
            kind: OTP_KIND.VerifyAccount
        })

        return { otp_id: result.insertedId, otp: otp }
    }

    async sendVerifyAccountOTPByPhone(phone_number: string) {
        // send otp to phone
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const result = await otpService.sendPhone({
            phone_number,
            otp,
            kind: OTP_KIND.VerifyAccount
        })

        return { otp_id: result.insertedId, otp: otp }
    }

    async disableOTP(user_id: ObjectId) {
        await otpService.checkExistOtp(user_id)
        return true
    }

    async resetPassword(user_id: ObjectId, password: string) {
        const hashedPassword = hashPassword(password)

        await databaseService.users.updateOne(
            { _id: user_id },
            { $set: { password: hashedPassword } }
        )

        await this.disableOTP(user_id)

        return true
    }

    async verifyAccount(user_id: ObjectId) {
        await databaseService.users.updateOne(
            { _id: user_id },
            { $set: { status: UserVerifyStatus.Verified } }
        )

        await this.disableOTP(user_id)

        return true
    }

    async updateMe({
        user_id,
        payload
    }: {
        user_id: string
        payload: UpdateMeReqBody
    }) {
        const user = await databaseService.users.findOneAndUpdate(
            { _id: new ObjectId(user_id) },
            [
                {
                    $set: {
                        ...payload,
                        updated_at: '$$NOW'
                    }
                }
            ],
            {
                returnDocument: 'after',
                projection: {
                    password: 0,
                    email_verify_token: 0,
                    forgot_password_token: 0
                }
            }
        )
        return user
    }
}

const usersService = new UsersService()
export default usersService
