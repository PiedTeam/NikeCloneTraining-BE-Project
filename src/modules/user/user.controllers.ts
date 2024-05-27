import 'dotenv/config'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omit } from 'lodash'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'

import decrypt, { encrypt } from '~/utils/crypto'
import { USER_MESSAGES } from './user.messages'
import {
    LoginRequestBody,
    RegisterReqBody,
    TokenPayload,
    UpdateMeReqBody,
    UserResponseSearch
} from './user.requests'
import User from './user.schema'
import usersService from './user.services'

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
    const user = req.user as User
    const user_id = user._id as ObjectId
    const result = await usersService.login({
        user_id: user_id.toString(),
        status: user.status
    })

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

export const getMeController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const user = await usersService.getme(user_id)

    const { first_name, last_name, status } = user
    const email = user.email !== '' ? await decrypt(user.email) : ''
    const phone_number =
        user.phone_number !== '' ? await decrypt(user.phone_number) : ''

    return res.status(200).json({
        message: USER_MESSAGES.GET_ME_SUCCESSFULLY,
        data: {
            user_id,
            first_name,
            last_name,
            email,
            phone_number,
            status
        }
    })
}

export const updateMeController = async (
    req: Request<ParamsDictionary, any, UpdateMeReqBody>,
    res: Response,
    next: NextFunction
) => {
    const { user_id } = (req as Request).decoded_authorization as TokenPayload
    const body = omit(req.body, ['decoded_authorization', 'code'])
    const user = await usersService.updateMe({
        user_id,
        payload: body as UpdateMeReqBody
    })
    return res.json({
        message: USER_MESSAGES.UPDATE_ME_SUCCESSFULLY,
        user
    })
}

export const changePasswordController = async (req: Request, res: Response) => {
    const user_id = req.body.user_id
    const new_password = req.body.new_password
    const result = await usersService.resetPassword(user_id, new_password)
    return res.status(200).json({
        message: USER_MESSAGES.RESET_PASSWORD_SUCCESSFULLY,
        details: result
    })
}

export const searchAccountController = async (req: Request, res: Response) => {
    const data = req.body as UserResponseSearch

    let result = false
    let user

    if (data.type === 'email') {
        if (await usersService.checkEmailExist(encrypt(data.email))) {
            result = true
            user = await usersService.findUserByEmail(encrypt(data.email))
        }
    } else {
        if (
            await usersService.checkPhoneNumberExist(encrypt(data.phone_number))
        ) {
            result = true
            user = await usersService.findUserByPhone(
                encrypt(data.phone_number)
            )
        }
    }

    if (result) {
        res.status(HTTP_STATUS.OK).json({
            isExist: result,
            data: user
        })
    } else {
        res.status(HTTP_STATUS.NOT_FOUND).json({
            isExist: result
        })
    }
}
