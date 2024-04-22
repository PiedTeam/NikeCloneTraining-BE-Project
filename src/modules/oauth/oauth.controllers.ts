import { Request, Response } from 'express'
import { loginSuccessService } from './oauth.services'
import { encrypt } from '~/utils/crypto'

export const loginSuccessController = async (req: Request, res: Response) => {
    const { access_token, refresh_token, new_user, iat, exp } = req.query

    res.redirect(
        `${process.env.FE_REDIRECT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}&iat=${iat}&exp=${exp}`
    )
}

export const loginFailController = () => {
    return {
        message: 'Login fail',
        status: 401
    }
}
