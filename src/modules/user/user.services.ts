import databaseService from '~/database/database.services'
import User from './user.schema'
import { ObjectId } from 'mongodb'
import { RegisterReqBody } from './user.requests'
import { encrypt, hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserRole } from './user.enum'
import RefreshToken from '../refreshToken/refreshToken.schema'

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

    async register(payload: RegisterReqBody) {
        const user_id = new ObjectId()

        // verify email

        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(user_id.toString())

        const { iat, exp } = await this.decodeRefreshToken(refresh_token)

        await databaseService.users.insertOne(
            new User({
                ...payload,
                _id: user_id,
                email: encrypt(payload.email),
                phone_number:
                    payload.phone_number === undefined
                        ? ''
                        : encrypt(payload.phone_number),
                password: hashPassword(payload.password)
            })
        )

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
