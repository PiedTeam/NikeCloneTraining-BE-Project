import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import request from "request";
import { CAPCHA_MESSAGES } from "./capcha.messages";

export const verifyTokenCapchaController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { capcha } = req.body;

    if (!capcha) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: CAPCHA_MESSAGES.TOKEN_REQUIRED });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPCHA_SECRET_KEY}&response=${capcha}`;

    request(verifyUrl, (err, response, body) => {
        if (err) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: CAPCHA_MESSAGES.WRONG_TOKEN });
        }

        const data = JSON.parse(body);

        if (!data.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: CAPCHA_MESSAGES.CAPCHA_VERIFICATION_FAILED,
            });
        } else if (data.score < 0.5) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: CAPCHA_MESSAGES.YOU_MIGHT_BE_A_BOT,
                score: data.score,
            });
        }

        return res.json({
            success: true,
            message: CAPCHA_MESSAGES.CAPCHA_VERIFICATION_PASS,
            score: data.score,
        });
    });
};
