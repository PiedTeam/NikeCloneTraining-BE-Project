import { NextFunction, Request, Response } from "express";
import { accessTokenValidator } from "../user/user.middlewares";
import { getOpenRoutes } from "./protect.utils";

export const protectRouterValidator = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const openRoutes = getOpenRoutes();

    // if do not need access_token, skip this middleware
    if (openRoutes.includes(req.path)) {
        return next();
    }

    // else validate access_token
    accessTokenValidator(req, res, next);
};
