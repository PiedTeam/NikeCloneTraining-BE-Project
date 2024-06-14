import 'dotenv/config'
import { capitalize, omit } from 'lodash'
import { ObjectId } from 'mongodb'
import otpGenerator from 'otp-generator'
import databaseService from '~/database/database.services'
import { capitalizePro } from '~/utils/capitalize'
import { encrypt, hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { OTP_KIND } from '../otp/otp.enum'
import otpService from '../otp/otp.services'
import RefreshToken from '../refreshToken/refreshToken.schema'
import { NoticeUser, TokenType, UserRole, UserVerifyStatus } from './user.enum'
import {
    LogoutReqBody,
    RegisterOauthReqBody,
    RegisterReqBody,
    UpdateMeReqBody
} from './user.requests'
import User from './user.schema'

class UsersService {
    private decodeRefreshToken(refresh_token: string) {
        return verifyToken({
            token: refresh_token,
            secretOrPublickey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })
    }

    private signAccessToken(
        user_id: string,
        status: UserVerifyStatus,
        role: UserRole
    ) {
        return signToken({
            payload: {
                user_id: user_id,
                token_type: TokenType.Access,
                status,
                role
            },
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
        status: UserVerifyStatus,
        role: UserRole
    ) {
        return Promise.all([
            this.signAccessToken(user_id, status, role),
            this.signRefreshToken(user_id, status)
        ])
    }

    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }

    async checkEmailIsVerified(email: string) {
        const user = await databaseService.users.findOne({
            email,
            status: UserVerifyStatus.Verified
        })
        return Boolean(user)
    }

    async checkPhoneNumberIsVerified(phone_number: string) {
        const user = await databaseService.users.findOne({
            phone_number,
            status: UserVerifyStatus.Verified
        })
        return Boolean(user)
    }

    // async checkUsernameExist(username: string) {
    //     const user = await databaseService.users.findOne({ username })
    //     return Boolean(user)
    // }

    async findUserByEmail(email: string) {
        const user = await databaseService.users.findOne({ email })
        return user
    }

    async findUserByPhone(phone_number: string) {
        const user = await databaseService.users.findOne({ phone_number })
        return user
    }

    async checkPhoneNumberExist(phone_number: string) {
        const user = await databaseService.users.findOne({ phone_number })
        return Boolean(user)
    }

    async checkPasswordExist(password: string) {
        password = hashPassword(password)
        const user = await databaseService.users.findOne({ password })
        return Boolean(user)
    }

    async findUser(user_id: string, password: string) {
        const user = await databaseService.users.findOne({
            _id: new ObjectId(user_id),
            password: hashPassword(password)
        })
        return user
    }

    // get all data from users collection for upsert to firebase
    async findAllUser() {
        const users = await databaseService.users.find().toArray()
        return users
    }

    async getMe(user_id: string) {
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

    async isWarning(user_id: ObjectId) {
        const user = await databaseService.users.findOne({
            _id: user_id
        })
        return user?.notice === NoticeUser.Warning
    }

    async register(
        payload: RegisterReqBody | RegisterOauthReqBody,
        provider?: string
    ) {
        const user_id = new ObjectId()

        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(
                user_id.toString(),
                UserVerifyStatus.Unverified,
                UserRole.Customer
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
                    email: encrypt(payload.email),
                    status: UserVerifyStatus.Verified
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
        status,
        role
    }: {
        user_id: string
        status: UserVerifyStatus
        role: UserRole
    }) {
        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(user_id, status, role)

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
        if (payload.password) payload.password = hashPassword(payload.password)

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

    async logout({ refresh_token }: LogoutReqBody) {
        await databaseService.refreshTokens.deleteOne({
            token: refresh_token
        })
    }
}

const usersService = new UsersService()
export default usersService
