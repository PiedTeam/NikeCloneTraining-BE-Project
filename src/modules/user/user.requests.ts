import { JwtPayload } from 'jsonwebtoken'
import { Subscription, TokenType, UserVerifyStatus } from './user.enum'

export interface RegisterReqBody {
    username: string
    first_name: string
    last_name: string
    password: string
    email?: string
    phone_number?: string
    avatar_url?: string
    subscription: Subscription
}

export interface LoginRequestBody {
    username?: string
    email?: string
    phone_number?: string
    password: string
}

export interface RegisterOauthReqBody extends RegisterReqBody {
    username: string
    first_name: string
    last_name: string
    avatar_url: string
    email?: string
    phone_number?: string
    subscription: Subscription
}

export interface TokenPayload extends JwtPayload {
    user_id: string
    token_type: TokenType
    verify: UserVerifyStatus
    iat: number
    exp: number
}
