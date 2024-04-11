import { RequestHandler } from 'express'
import { NextFunction, Request, Response } from 'express-serve-static-core'

export const wrapAsync = <P>(func: RequestHandler<P>) => {
    return async (req: Request<P>, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next)
        } catch (err) {
            next(err)
        }
    }
}
