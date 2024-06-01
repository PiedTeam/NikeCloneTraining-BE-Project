import { NextFunction, Request, Response } from 'express'
import databaseService from '~/database/database.services'
import { UserVerifyStatus } from '~/modules/user/user.enum'

export const cronJobFake = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = await databaseService.users.deleteMany({
        created_at: {
            $lte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
        },
        status: UserVerifyStatus.Unverified
    })
    next()
}
