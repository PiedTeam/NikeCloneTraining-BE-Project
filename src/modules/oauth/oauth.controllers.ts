import { Request, Response } from 'express'

export const loginSuccessController = (req: Request, res: Response) => {
    const user = req.user
    if (!user) {
        return res.status(401).json({
            message: 'Unauthorized',
            status: 401
        })
    }
}

export const loginFailController = () => {}
