import { Response, Request, NextFunction } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/errors/errors.entityError'

export const defaultErrorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err)
}
