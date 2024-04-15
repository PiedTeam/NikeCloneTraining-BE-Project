import { JwtPayload } from 'jsonwebtoken'
import { Subscription, TokenType, UserVerifyStatus } from './user.enum'

export interface RegisterReqBody {
    username: string
    first_name: string
    last_name: string
    password: string
    subscription: Subscription
}

export interface TokenPayload extends JwtPayload {
    user_id: string
    token_type: TokenType
    verify: UserVerifyStatus
    iat: number
    exp: number
}
