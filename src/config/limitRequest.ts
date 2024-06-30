import { rateLimit } from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import { USER_MESSAGES } from "~/modules/user/user.messages";

//! Prevent Dos attack - one IP can only make 3 requests in 5 minutes
export const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // Defaults to 60000 ms (= 1 minute)
    limit: 3, // The maximum number of connections to allow during the window before rate limiting the client
    standardHeaders: true,
    // legacyHeaders: true,
    handler: function (req, res, next) {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            message: USER_MESSAGES.TOO_MANY_REQUESTS,
        });
    },
});
