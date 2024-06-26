import { RequestHandler } from "express";
import { NextFunction, Request, Response } from "express-serve-static-core";

export const wrapAsync =
    (func: RequestHandler) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next);
        } catch (err) {
            next(err);
        }
    };
