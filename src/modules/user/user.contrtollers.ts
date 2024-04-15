import { NextFunction, Request, Response } from 'express'
import usersService from './user.services'
import { RegisterReqBody } from './user.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { USER_MESSAGES } from './user.messages'

export const registerController = async (
    req: Request<ParamsDictionary, any, RegisterReqBody>,
    res: Response,
    next: NextFunction
) => {
    const result = await usersService.register(req.body)
    return res.json({
        message: USER_MESSAGES.REGISTER_SUCCESS,
        data: result
    })
}
