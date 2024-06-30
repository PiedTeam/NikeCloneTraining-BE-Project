import { Request, Response } from "express";
import "dotenv/config";
import { StatusCodes } from "http-status-codes";

export const loginSuccessController = async (req: Request, res: Response) => {
    const { access_token, refresh_token, new_user, iat, exp } = req.query;

    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: Number(process.env.COOKIE_EXPIRE),
    });

    res.redirect(
        `${process.env.FE_REDIRECT_URL}/?access_token=${access_token}&new_user=${new_user}&iat=${iat}&exp=${exp}`,
    );
};

export const loginFailController = () => {
    return {
        message: "Login fail",
        status: StatusCodes.UNAUTHORIZED,
    };
};
