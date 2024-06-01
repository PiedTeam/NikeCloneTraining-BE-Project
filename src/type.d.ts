import { TokenPayload } from './modules/user/user.requests'
import User from './modules/user/user.schema'
import { Request } from 'express'

declare module 'express-serve-static-core' {
    interface Request {
        user?: User
        decoded_authorization?: TokenPayload
        decoded_refresh_token?: TokenPayload
    }
}
