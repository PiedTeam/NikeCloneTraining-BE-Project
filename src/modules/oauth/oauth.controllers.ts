import { Request, Response } from 'express'
import { loginSuccessService } from './oauth.services'
import { encrypt } from '~/utils/crypto'

export const loginSuccessController = async (req: Request, res: Response) => {
    const result = await loginSuccessService(encrypt(req.body.email))
    res.status(200).json({ message: 'Login successfully', data: result })
}

export const loginFailController = () => {
    return {
        message: 'Login fail',
        status: 401
    }
}
