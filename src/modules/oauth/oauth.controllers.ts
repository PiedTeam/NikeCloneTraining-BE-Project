import { Request, Response } from 'express'
import { loginSuccessService } from './oauth.services'
import { encrypt } from '~/utils/crypto'

export const loginSuccessController = async (req: Request, res: Response) => {
    const { access_token, refresh_token, new_user } = req.body
    res.redirect(
        `${process.env.FE_REDIRECT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}`
    )
    // localhost:3000/oauth/google/?access_token=ya29.a0AfH6SMA&refresh_token=1&new_user=true
}

export const loginFailController = () => {
    return {
        message: 'Login fail',
        status: 401
    }
}
