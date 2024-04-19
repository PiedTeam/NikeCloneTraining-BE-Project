import { NextFunction, Request, Response } from 'express'
import usersService from './user.services'
import { LoginRequestBody, RegisterReqBody } from './user.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { USER_MESSAGES } from './user.messages'
import User from './user.schema'
import { ObjectId } from 'mongodb'

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

export const loginController = async (
    req: Request<ParamsDictionary, any, LoginRequestBody>,
    res: Response,
    next: NextFunction
) => {
    const user_id = (req.user as User)._id as ObjectId
    const result = await usersService.login(user_id.toString() as string)
    res.json({
        message: USER_MESSAGES.LOGIN_SUCCESS,
        data: result
    })
}
