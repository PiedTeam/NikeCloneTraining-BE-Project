import { Request, Response } from 'express'
import 'dotenv/config'

export const loginSuccessController = async (req: Request, res: Response) => {
    console.log('req.body', req.body)
    res.status(200).json({
        message: 'Login success',
        details: req.body
    })
}

export const loginFailController = () => {
    return {
        message: 'Login fail',
        status: 401
    }
}
