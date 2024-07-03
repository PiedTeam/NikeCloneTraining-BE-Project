import { NextFunction, Request, Response } from "express";
import { ParamSchema, checkSchema } from "express-validator";
import {
    accessTokenValidator,
    accessTokenValidatorV2,
} from "../user/user.middlewares";
import { getOpenRoutes } from "./protect.utils";

export const paramSchema: ParamSchema = {
    customSanitizer: {
        options: async (value) => {
            return escape(value);
        },
    },
};

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
    accessTokenValidatorV2(req, res, next);
};
