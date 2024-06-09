import { JwtPayload } from 'jsonwebtoken'
import { Subscription, TokenType, UserVerifyStatus } from './user.enum'

export interface RegisterReqBody {
    email_phone: string
    first_name: string
    last_name: string
    password: string
    email?: string
    phone_number?: string
    avatar_url?: string
    subscription: Subscription
}

export interface LoginRequestBody {
    // username?: string
    email?: string
    phone_number?: string
    password: string
}

export interface RegisterOauthReqBody {
    // username: string
    first_name: string
    last_name: string
    avatar_url: string
    email?: string
    phone_number?: string
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

export interface ResetPasswordReqBody {
    email_phone: string
    forgot_password_token: string
    password: string
    confirm_password: string
}

export interface UpdateMeReqBody {
    // username?: string
    first_name?: string
    last_name?: string
    email?: string
    phone_number?: string
    avatar_url?: string
    subscription?: Subscription
}

type UserResponseEmail = {
    email: string
    type: 'email'
}

type UserResponsePhone = {
    phone_number: string
    type: 'phone_number'
}

export type UserResponseSearch = UserResponseEmail | UserResponsePhone

export type LogoutReqBody = {
    refresh_token: string
}
