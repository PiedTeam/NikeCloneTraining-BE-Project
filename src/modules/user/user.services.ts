import databaseService from '~/database/database.services'
import User from './user.schema'
import { ObjectId } from 'mongodb'
import { RegisterOauthReqBody, RegisterReqBody } from './user.requests'
import { encrypt, hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserRole } from './user.enum'
import RefreshToken from '../refreshToken/refreshToken.schema'
import { omit } from 'lodash'

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
                    ...(omit(payload, [
                        'phone_number',
                        'email'
                    ]) as RegisterReqBody),
                    password: hashPassword(payload.password)
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
}

const usersService = new UsersService()
export default usersService
