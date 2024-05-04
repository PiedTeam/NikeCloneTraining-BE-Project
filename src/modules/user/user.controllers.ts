import { NextFunction, Request, Response } from 'express'
import usersService from './user.services'
import { LoginRequestBody, RegisterReqBody } from './user.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { USER_MESSAGES } from './user.messages'
import User from './user.schema'
import { ObjectId } from 'mongodb'
import 'dotenv/config'

export const registerController = async (
    req: Request<ParamsDictionary, any, RegisterReqBody>,
    res: Response,
    next: NextFunction
) => {
    const result = await usersService.register(req.body)
    const { refresh_token } = result
    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: Number(process.env.COOKIE_EXPIRE)
    })

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

    const { refresh_token } = result
    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: Number(process.env.COOKIE_EXPIRE)
    })

    res.json({
        message: USER_MESSAGES.LOGIN_SUCCESS,
        data: result
    })
}

export const forgotPasswordController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result =
        req.body.type === 'email'
            ? await usersService.sendForgotPasswordOTPByEmail(req.body.email)
            : await usersService.sendForgotPasswordOTPByPhone(
                  req.body.phone_number
              )
    return res.status(200).json({
        message: USER_MESSAGES.SEND_OTP_SUCCESSFULLY,
        details: result
    })
}

export const verifyForgotPasswordTokenController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return res.status(200).json({
        message: USER_MESSAGES.VERIFY_OTP_SUCCESSFULLY
    })
}

export const resetPasswordController = async (req: Request, res: Response) => {
    const user_id = req.body.user_id
    const password = req.body.password
    const result = await usersService.resetPassword(user_id, password)
    return res.status(200).json({
        message: USER_MESSAGES.RESET_PASSWORD_SUCCESSFULLY,
        details: result
    })
}

export const sendVerifyAccountOTPController = async (
    req: Request,
    res: Response
) => {
    const result =
        req.body.type === 'email'
            ? await usersService.sendVerifyAccountOTPByEmail(req.body.email)
            : await usersService.sendVerifyAccountOTPByPhone(
                  req.body.phone_number
              )
    return res.status(200).json({
        message: USER_MESSAGES.SEND_OTP_SUCCESSFULLY,
        details: result
    })
}

export const verifyAccountController = async (req: Request, res: Response) => {
    const user_id = req.body.user_id
    const result = await usersService.verifyAccount(user_id)
    return res.status(200).json({
        message: USER_MESSAGES.VERIFY_ACCOUNT_SUCCESSFULLY,
        details: result
    })
}
