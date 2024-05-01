import { NextFunction, Request, Response } from 'express'
import databaseService from '~/database/database.services'
import { USER_MESSAGES } from '../user/user.messages'
import User from '../user/user.schema'
import { ObjectId } from 'mongodb'
import { encrypt, hashPassword } from '~/utils/crypto'

export const registerPassword = async (req: Request, res: Response) => {
    try {
        const user_email = (req.body as User).email
        const pass = await hashPassword(req.body.password)
        const userPassword = await databaseService.users.findOneAndUpdate(
            { email: encrypt(user_email) },
            { $set: { password: pass } }
        )
        return res.json({
            message: USER_MESSAGES.REGISTER_SUCCESS,
            data: userPassword
        })
    } catch (err) {
        return {
            message: 'register password fail',
            status: 401
        }
    }
}
