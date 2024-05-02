import databaseService from '~/database/database.services'
import User from './user.schema'
import { ObjectId } from 'mongodb'
import {
    LoginRequestBody,
    RegisterOauthReqBody,
    RegisterReqBody
} from './user.requests'
import { encrypt, hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserRole, UserVerifyStatus } from './user.enum'
import RefreshToken from '../refreshToken/refreshToken.schema'
import { omit } from 'lodash'
import { USER_MESSAGES } from './user.messages'
import { config } from 'dotenv'
import { sendOtpMailController } from '../otp/otp.controllers'
import otpGenerator from 'otp-generator'
import { SendOtpViaMailReqBody } from '../otp/otp.requests'
import otpService from '../otp/otp.services'
import { OTP_MESSAGES } from '../otp/otp.messages'
import { OTP_KIND } from '../otp/otp.enum'
config()

class UsersService {
    private decodeRefreshToken(refresh_token: string) {
        return verifyToken({
            token: refresh_token,
            secretOrPublickey: process.env.JWT_PRIVATE_KEY as string
        })
    }

    private signAccessToken(user_id: string) {
        return signToken({
            payload: { user_id: user_id, token_type: TokenType.Access },
            options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES }
        })
    }

    private signRefreshToken(user_id: string) {
        return signToken({
            payload: { user_id: user_id, token_type: TokenType.Refresh },
            options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_DAYS }
        })
    }

    private signAccessAndRefreshToken(user_id: string) {
        return Promise.all([
            this.signAccessToken(user_id),
            this.signRefreshToken(user_id)
        ])
    }

    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }

    async checkUsernameExist(username: string) {
        const user = await databaseService.users.findOne({ username })
        return Boolean(user)
    }

    async checkPhoneNumberExist(phone_number: string) {
        const user = await databaseService.users.findOne({ phone_number })
        return Boolean(user)
    }

    async register(
        payload: RegisterReqBody | RegisterOauthReqBody,
        provider?: string
    ) {
        const user_id = new ObjectId()

        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(user_id.toString())

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
                    username: payload.first_name + ' ' + payload.last_name,
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

    async login(user_id: string) {
        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(user_id)

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

        const result = await otpService.sendOtpPhone({ phone_number, otp })

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
}

const usersService = new UsersService()
export default usersService
