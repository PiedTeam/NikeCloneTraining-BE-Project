import { Response, Request, NextFunction } from "express";
import { omit } from "lodash";
import { ErrorWithStatus } from "~/errors/errors.entityError";
import { StatusCodes } from "http-status-codes";

export const defaultErrorHandler = (
    err: any,
    // err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err)

    if (err instanceof ErrorWithStatus)
        return res.status(err.status).json(omit(err, ["status"]));

    Object.getOwnPropertyNames(err).forEach((key) => {
        Object.defineProperty(err, key, { enumerable: true });
    });

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        errorInfo: omit(err, ["stack"]),
    });
};
