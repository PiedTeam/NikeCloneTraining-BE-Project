import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import 'dotenv/config'
import { isProduction } from '~/index'

export const loginSuccessController = async (req: Request, res: Response) => {
    const { access_token, refresh_token, new_user, iat, exp } = req.query

    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: Number(process.env.COOKIE_EXPIRE)
    })
    const urlFERedirect = isProduction
        ? (process.env.DEVELOPMENT_FE_REDIRECT_URL as string)
        : (process.env.PRODUCTION_FE_REDIRECT_URL as string)

    res.redirect(`${urlFERedirect}/?access_token=${access_token}&new_user=${new_user}&iat=${iat}&exp=${exp}`)
}

export const loginFailController = () => {
    return { message: 'Login fail', status: StatusCodes.UNAUTHORIZED }
}
