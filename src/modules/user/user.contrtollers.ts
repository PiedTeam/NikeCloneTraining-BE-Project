import { Request, Response } from 'express'
import usersService from './user.services'
import { RegisterReqBody } from './user.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { USERS_MESSAGES } from './user.messages'

export const registerController = async (
    req: Request<ParamsDictionary, any, RegisterReqBody>,
    res: Response
) => {
    const result = await usersService.register(req.body)
    return res.json({
        message: USERS_MESSAGES.REGISTER_SUCCESS,
        data: result
    })
}
