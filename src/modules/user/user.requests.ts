import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from './user.enum'

export interface RegisterReqBody {
    username: string
    first_name: string
    last_name: string
    email: string
    phone_number?: string
    password: string
}

export interface TokenPayload extends JwtPayload {
    user_id: string
    token_type: TokenType
    verify: UserVerifyStatus
    iat: number
    exp: number
}
