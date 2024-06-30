import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParamSchema, checkSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { capitalize, escape } from "lodash";
import { ObjectId } from "mongodb";
import validator from "validator";
import { HTTP_STATUS } from "~/constants/httpStatus";
import databaseService from "~/database/database.services";
import { ErrorEntity, ErrorWithStatus } from "~/errors/errors.entityError";
import { USER_MESSAGES } from "~/modules/user/user.messages";
import { isDeveloperAgent } from "~/utils/agent";
import { encrypt, hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
import { isValidPhoneNumberForCountry, validate } from "~/utils/validation";
import { OTP_STATUS } from "../otp/otp.enum";
import { OTP_MESSAGES } from "../otp/otp.messages";
import otpService from "../otp/otp.services";
import { NoticeUser, UserVerifyStatus } from "./user.enum";
import { LoginRequestBody, TokenPayload } from "./user.requests";
import usersService from "./user.services";
import { StatusCodes } from "http-status-codes";

//! Prevent db injection, XSS attack
export const paramSchema: ParamSchema = {
    customSanitizer: {
        options: async (value) => {
            return escape(value);
        },
    },
};

export const usernameSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED,
    },
    isString: {
        errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING,
    },
    isLength: {
        options: {
            min: 1,
            max: 50,
        },
        errorMessage: USER_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_50,
    },
    custom: {
        options: (value: string) => {
            if (!/[a-zA-Z]/.test(value)) {
                throw new Error(USER_MESSAGES.USERNAME_MUST_CONTAIN_ALPHABET);
            }
            return true;
        },
    },
};

export const emailSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED,
    },
    isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID,
    },
    normalizeEmail: {
        options: {
            all_lowercase: true,
            gmail_lowercase: true,
            gmail_remove_dots: true,
            gmail_remove_subaddress: true,
            gmail_convert_googlemaildotcom: true,
            outlookdotcom_lowercase: true,
            outlookdotcom_remove_subaddress: true,
            yahoo_lowercase: true,
            yahoo_remove_subaddress: true,
            icloud_lowercase: true,
            icloud_remove_subaddress: true,
        },
    },
};

export const phone_numberSchema: ParamSchema = {
    optional: { options: { nullable: true } },
    trim: true,
    notEmpty: { errorMessage: USER_MESSAGES.PHONE_NUMBER_IS_REQUIRED },
    isString: { errorMessage: USER_MESSAGES.PHONE_NUMBER_MUST_BE_STRING },
    isMobilePhone: {
        options: ["vi-VN"],
        errorMessage: USER_MESSAGES.PHONE_NUMBER_IS_INVALID,
    },
};

export const passwordSchema: ParamSchema = {
    trim: true,
    notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
    isString: { errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING },
    isStrongPassword: {
        options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG,
    },
};

const confirmPasswordSchema: ParamSchema = {
    trim: true,
    notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
    isString: { errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING },
    isStrongPassword: {
        options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG,
    },
    custom: {
        options: (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(
                    USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH_PASSWORD,
                );
            }

            return true;
        },
    },
};

export const firstnameSchema: ParamSchema = {
    trim: true,
    notEmpty: { errorMessage: USER_MESSAGES.FIRST_NAME_IS_REQUIRED },
    isString: { errorMessage: USER_MESSAGES.FIRST_NAME_MUST_BE_STRING },
    isLength: {
        options: { min: 1, max: 50 },
        errorMessage: USER_MESSAGES.FIRST_NAME_LENGTH_MUST_BE_FROM_1_TO_50,
    },
};

export const lastnameSchema: ParamSchema = {
    trim: true,
    notEmpty: { errorMessage: USER_MESSAGES.LAST_NAME_IS_REQUIRED },
    isString: { errorMessage: USER_MESSAGES.LAST_NAME_MUST_BE_STRING },
    isLength: {
        options: { min: 1, max: 50 },
        errorMessage: USER_MESSAGES.LAST_NAME_LENGTH_MUST_BE_FROM_1_TO_50,
    },
};

export const imageSchema: ParamSchema = {
    optional: true,
    isString: { errorMessage: USER_MESSAGES.IMAGE_URL_MUST_BE_A_STRING },
    trim: true,
    isLength: {
        options: { min: 1, max: 400 },
        errorMessage: USER_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400,
    },
};

export const registerValidator = validate(
    checkSchema(
        {
            first_name: { ...paramSchema, ...firstnameSchema },
            last_name: { ...paramSchema, ...lastnameSchema },
            password: { ...paramSchema, ...passwordSchema },
            phone_number: {
                ...paramSchema,
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value) => {
                        const isExist =
                            await usersService.checkPhoneNumberExist(
                                encrypt(value),
                            );
                        if (isExist) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_IS_ALREADY_EXISTED,
                            );
                        }
                        return true;
                    },
                },
            },
            email: {
                ...paramSchema,
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value) => {
                        const isExist = await usersService.checkEmailExist(
                            encrypt(value),
                        );
                        if (isExist) {
                            throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
                        }
                        return true;
                    },
                },
            },
            // confirm_password: confirmPasswordSchema
        },
        ["body"],
    ),
);

export const loginCheckMissingField = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const body = req.body as LoginRequestBody;
    if (!body.email && !body.phone_number) {
        next(
            new ErrorEntity({
                message: USER_MESSAGES.UNPROCESSABLE_ENTITY,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                data: { field: { msg: USER_MESSAGES.FIELD_IS_REQUIRED } },
            }),
        );
    }
    next();
};

export const checkVerifyAccount = validate(
    checkSchema({
        email_phone: {
            notEmpty: { errorMessage: USER_MESSAGES.EMAIL_PHONE_IS_REQUIRED },
        },
    }),
);

export const checkEmailOrPhone = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const body = req.body as ParamsDictionary;
    const email_phone = body.email_phone;
    if (validator.isEmail(email_phone)) {
        req.body.email = email_phone;
        req.body.type = "email";
    } else if (isValidPhoneNumberForCountry(email_phone, "VN")) {
        req.body.phone_number = email_phone;
        req.body.type = "phone_number";
    } else {
        next(
            new ErrorEntity({
                message: USER_MESSAGES.UNPROCESSABLE_ENTITY,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                data: { field: { msg: USER_MESSAGES.FIELD_ERROR_FORMAT } },
            }),
        );
    }
    delete req.body.email_phone;
    next();
};

export const loginValidator = validate(
    checkSchema(
        {
            email: {
                ...paramSchema,
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            email: encrypt(value),
                        });

                        if (!user) {
                            throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND);
                        }

                        if (
                            user.notice === NoticeUser.Banned ||
                            user.reasonBanned !== ""
                        ) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                status: StatusCodes.LOCKED,
                            });
                        }

                        const wrongPasswordTimes =
                            user.wrongPasswordTimes as number;
                        const NUMBER_LIMIT_WRONG_PASSWORD = 5;

                        if (user.password !== hashPassword(req.body.password)) {
                            // user input wrong password 5 times => account will be banned
                            if (
                                wrongPasswordTimes <=
                                NUMBER_LIMIT_WRONG_PASSWORD - 1
                            ) {
                                // For each wrong password, wrongPasswordTimes++
                                await databaseService.users.updateOne(
                                    { email: encrypt(value) },
                                    [
                                        {
                                            $set: {
                                                wrongPasswordTimes:
                                                    wrongPasswordTimes + 1,
                                            },
                                        },
                                    ],
                                );
                            }

                            if (
                                (user.wrongPasswordTimes as number) >=
                                NUMBER_LIMIT_WRONG_PASSWORD - 1
                            ) {
                                // Banned user
                                await databaseService.users.updateOne(
                                    { email: encrypt(value) },
                                    [
                                        {
                                            $set: {
                                                notice: NoticeUser.Banned,
                                                reasonBanned:
                                                    USER_MESSAGES.WRONG_PASS_5_TIMES,
                                            },
                                        },
                                    ],
                                );
                                throw new ErrorWithStatus({
                                    message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                    status: StatusCodes.LOCKED,
                                });
                            }
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG);
                        }

                        // reset wrongPasswordTimes to 0 when user login successfully
                        await databaseService.users.updateOne(
                            { email: encrypt(value) },
                            [{ $set: { wrongPasswordTimes: 0 } }],
                        );
                        (req as Request).user = user;

                        return true;
                    },
                },
            },
            phone_number: {
                ...paramSchema,
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            phone_number: encrypt(value),
                        });
                        if (!user) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_NOT_FOUND,
                            );
                        }

                        if (
                            user.notice === NoticeUser.Banned ||
                            user.reasonBanned !== ""
                        ) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                status: StatusCodes.LOCKED,
                            });
                        }

                        const wrongPasswordTimes =
                            user.wrongPasswordTimes as number;
                        const NUMBER_LIMIT_WRONG_PASSWORD = 5;

                        if (user.password !== hashPassword(req.body.password)) {
                            // user input wrong password 5 times => account will be banned
                            if (
                                wrongPasswordTimes <=
                                NUMBER_LIMIT_WRONG_PASSWORD - 1
                            ) {
                                // For each wrong password, wrongPasswordTimes++
                                await databaseService.users.updateOne(
                                    { phone_number: encrypt(value) },
                                    [
                                        {
                                            $set: {
                                                wrongPasswordTimes:
                                                    wrongPasswordTimes + 1,
                                            },
                                        },
                                    ],
                                );
                            }

                            if (
                                (user.wrongPasswordTimes as number) >=
                                NUMBER_LIMIT_WRONG_PASSWORD - 1
                            ) {
                                // Banned user
                                await databaseService.users.updateOne(
                                    { phone_number: encrypt(value) },
                                    [
                                        {
                                            $set: {
                                                notice: NoticeUser.Banned,
                                                reasonBanned:
                                                    USER_MESSAGES.WRONG_PASS_5_TIMES,
                                            },
                                        },
                                    ],
                                );
                                throw new ErrorWithStatus({
                                    message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                    status: StatusCodes.LOCKED,
                                });
                            }

                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG);
                        }

                        // reset wrongPasswordTimes to 0 when user login successfully
                        await databaseService.users.updateOne(
                            { phone_number: encrypt(value) },
                            [{ $set: { wrongPasswordTimes: 0 } }],
                        );
                        (req as Request).user = user;

                        return true;
                    },
                },
            },
            password: {
                ...paramSchema,
                trim: true,
                notEmpty: { errorMessage: "Password is required" },
                isString: { errorMessage: "Password must be a string" },
            },
        },
        ["body"],
    ),
);

export const forgotPasswordValidator = validate(
    checkSchema(
        {
            email: {
                ...paramSchema,
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            email: encrypt(value),
                        });
                        if (user === null) {
                            throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND);
                        }
                        if (user.status === UserVerifyStatus.Unverified) {
                            throw new Error(
                                USER_MESSAGES.ACCOUNT_IS_NOT_VERIFIED,
                            );
                        }
                        if (user.notice === NoticeUser.Banned) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                status: HTTP_STATUS.FORBIDDEN,
                            });
                        }
                        req.user = user;
                        return true;
                    },
                },
            },
            phone_number: {
                ...paramSchema,
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            phone_number: encrypt(value),
                        });
                        if (user === null) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_NOT_FOUND,
                            );
                        }
                        if (user.notice === NoticeUser.Banned) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                status: HTTP_STATUS.FORBIDDEN,
                            });
                        }
                        req.user = user;
                        return true;
                    },
                },
            },
        },
        ["body"],
    ),
);

export const verifyForgotPasswordOTPValidator = validate(
    checkSchema(
        {
            forgot_password_otp: {
                ...paramSchema,
                trim: true,
                custom: {
                    options: async (value, { req }) => {
                        if (!value) {
                            throw new Error(
                                USER_MESSAGES.FORGOT_PASSWORD_OTP_IS_REQUIRED,
                            );
                        }
                        const user =
                            req.body.type === "email"
                                ? await databaseService.users.findOne({
                                      email: encrypt(req.body.email),
                                  })
                                : await databaseService.users.findOne({
                                      phone_number: encrypt(
                                          req.body.phone_number,
                                      ),
                                  });
                        if (!user) {
                            throw new Error(USER_MESSAGES.USER_NOT_FOUND);
                        }
                        const result = await databaseService.OTP.findOne({
                            user_id: user._id,
                            status: OTP_STATUS.Available,
                        });
                        if (!result) {
                            throw new Error(OTP_MESSAGES.OTP_NOT_FOUND);
                        }
                        if (result.incorrTimes >= 3) {
                            await databaseService.users.updateOne(
                                { _id: user._id },
                                { $set: { notice: NoticeUser.Warning } },
                            );
                            await databaseService.OTP.updateOne(
                                { _id: result._id },
                                { $set: { status: OTP_STATUS.Unavailable } },
                            );
                            throw new Error(
                                USER_MESSAGES.OVER_TIMES_REQUEST_METHOD,
                            );
                        }
                        if (
                            (result?.type === 1 &&
                                req.body.type === "phone_number") ||
                            (result?.type === 0 && req.body.type === "email")
                        ) {
                            throw new Error(
                                OTP_MESSAGES.REQUIRE_FIELD_IS_INVALID,
                            );
                        }
                        const otp = result?.OTP;
                        if (value !== otp) {
                            await databaseService.OTP.updateOne(
                                {
                                    _id: result._id,
                                },
                                {
                                    $set: {
                                        incorrTimes: result.incorrTimes + 1,
                                    },
                                },
                            );
                            //                             console.log(result)
                            throw new Error(OTP_MESSAGES.OTP_IS_INCORRECT);
                        }
                        req.body.user_id = user._id;
                    },
                },
            },
        },
        ["body"],
    ),
);

export const resetPasswordValidator = validate(
    checkSchema(
        {
            password: { ...paramSchema, ...passwordSchema },
            confirm_password: { ...paramSchema, ...confirmPasswordSchema },
            email_phone: {
                ...paramSchema,
                notEmpty: {
                    errorMessage: USER_MESSAGES.EMAIL_PHONE_IS_REQUIRED,
                },
                isString: {
                    errorMessage: USER_MESSAGES.EMAIL_PHONE_MUST_BE_STRING,
                },
            },
        },
        ["body"],
    ),
);

export const checkNewPasswordValidator = validate(
    checkSchema(
        {
            password: {
                ...paramSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            _id: req.body.user_id,
                        });
                        if (user?.password === hashPassword(value)) {
                            throw new Error(
                                USER_MESSAGES.NEW_PASSWORD_MUST_BE_NEW,
                            );
                        }
                    },
                },
            },
        },
        ["body"],
    ),
);

export const changePasswordValidator = validate(
    checkSchema(
        {
            old_password: {
                ...paramSchema,
                ...passwordSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user_info =
                            req.decoded_authorization as TokenPayload;
                        const user = await databaseService.users.findOne({
                            _id: new ObjectId(user_info.user_id),
                            password: hashPassword(value),
                        });
                        if (!user) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG);
                        }
                        req.body.user_id = user._id;
                        delete req.decoded_authorization;
                    },
                },
            },
            new_password: {
                ...paramSchema,
                ...passwordSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user_info =
                            req.decoded_authorization as TokenPayload;
                        const user = await databaseService.users.findOne({
                            _id: new ObjectId(user_info.user_id),
                            password: hashPassword(value),
                        });

                        if (user?.password === hashPassword(value)) {
                            throw new Error(
                                USER_MESSAGES.NEW_PASSWORD_MUST_BE_NEW,
                            );
                        }
                    },
                },
            },
        },
        ["body"],
    ),
);

export const verifyAccountValidator = validate(
    checkSchema(
        {
            email: {
                ...paramSchema,
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            email: encrypt(value),
                        });
                        if (user === null) {
                            throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND);
                        }
                        if (user.notice === NoticeUser.Banned) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                status: HTTP_STATUS.FORBIDDEN,
                            });
                        }
                        if (user.status === UserVerifyStatus.Verified) {
                            throw new Error(
                                USER_MESSAGES.ACCOUNT_ALREADY_VERIFIED,
                            );
                        }

                        req.user = user;
                        return true;
                    },
                },
            },
            phone_number: {
                ...paramSchema,
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            phone_number: encrypt(value),
                        });
                        if (user === null) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_NOT_FOUND,
                            );
                        }
                        if (user.notice === NoticeUser.Banned) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCOUNT_IS_BANNED,
                                status: HTTP_STATUS.FORBIDDEN,
                            });
                        }
                        if (user.status === UserVerifyStatus.Verified) {
                            throw new Error(
                                USER_MESSAGES.ACCOUNT_ALREADY_VERIFIED,
                            );
                        }
                        req.user = user;
                        return true;
                    },
                },
            },
        },
        ["body"],
    ),
);

export const verifyAccountOTPValidator = validate(
    checkSchema({
        verify_account_otp: {
            ...paramSchema,
            trim: true,
            custom: {
                options: async (value, { req }) => {
                    if (!value) {
                        throw new Error(
                            USER_MESSAGES.VERIFY_ACCOUNT_OTP_IS_REQUIRED,
                        );
                    }
                    const user =
                        req.body.type === "email"
                            ? await databaseService.users.findOne({
                                  email: encrypt(req.body.email),
                              })
                            : await databaseService.users.findOne({
                                  phone_number: encrypt(req.body.phone_number),
                              });
                    if (!user) {
                        throw new Error(USER_MESSAGES.USER_NOT_FOUND);
                    }
                    const result = await databaseService.OTP.findOne({
                        user_id: user._id,
                        status: OTP_STATUS.Available,
                    });
                    if (!result) {
                        throw new Error(OTP_MESSAGES.OTP_NOT_FOUND);
                    }
                    if (result.incorrTimes >= 3) {
                        await databaseService.users.updateOne(
                            { _id: user._id },
                            { $set: { notice: NoticeUser.Warning } },
                        );
                        await databaseService.OTP.updateOne(
                            { _id: result._id },
                            { $set: { status: OTP_STATUS.Unavailable } },
                        );
                        throw new Error(
                            USER_MESSAGES.OVER_TIMES_REQUEST_METHOD,
                        );
                    }
                    if (
                        (result?.type === 1 &&
                            req.body.type === "phone_number") ||
                        (result?.type === 0 && req.body.type === "email")
                    ) {
                        throw new Error(OTP_MESSAGES.REQUIRE_FIELD_IS_INVALID);
                    }
                    const otp = result?.OTP;
                    if (value !== otp) {
                        await databaseService.OTP.updateOne(
                            {
                                _id: result._id,
                            },
                            {
                                $set: {
                                    incorrTimes: result.incorrTimes + 1,
                                },
                            },
                        );
                        throw new Error(OTP_MESSAGES.OTP_IS_INCORRECT);
                    }
                    req.body.user_id = user._id;
                },
            },
        },
    }),
);

export const verifyOTPValidator = validate(
    checkSchema(
        {
            otp: {
                ...paramSchema,
                trim: true,
                custom: {
                    options: async (value, { req }) => {
                        if (!value) {
                            throw new Error(OTP_MESSAGES.OTP_IS_REQUIRED);
                        }

                        const user =
                            req.body.type === "email"
                                ? await databaseService.users.findOne({
                                      email: encrypt(req.body.email),
                                  })
                                : await databaseService.users.findOne({
                                      phone_number: encrypt(
                                          req.body.phone_number,
                                      ),
                                  });

                        if (!user) {
                            throw new Error(USER_MESSAGES.USER_NOT_FOUND);
                        }

                        const result = await databaseService.OTP.findOne({
                            user_id: user._id,
                            status: OTP_STATUS.Available,
                        });

                        if (!result) throw new Error(OTP_MESSAGES.OTP_iS_USED);

                        const isExpired = await otpService.isOTPExpired(result);
                        if (isExpired) {
                            await databaseService.OTP.updateOne(
                                { user_id: user._id },
                                { $set: { status: OTP_STATUS.Unavailable } },
                            );
                            throw new Error(OTP_MESSAGES.OTP_IS_EXPIRED);
                        }
                        if (result.incorrTimes >= 3) {
                            const isWarning = await usersService.isWarning(
                                user._id,
                            );
                            if (isWarning) {
                                await databaseService.users.updateOne(
                                    { _id: user._id },
                                    {
                                        $set: {
                                            notice: NoticeUser.Banned,
                                        },
                                    },
                                );
                                throw new Error(
                                    USER_MESSAGES.ACCOUNT_IS_BANNED,
                                );
                            }
                            await databaseService.users.updateOne(
                                { _id: user._id },
                                {
                                    $set: {
                                        notice: NoticeUser.Warning,
                                    },
                                },
                            );
                            await databaseService.OTP.updateOne(
                                { user_id: user._id },
                                { $set: { status: OTP_STATUS.Unavailable } },
                            );
                            throw new Error(
                                USER_MESSAGES.OVER_TIMES_REQUEST_METHOD,
                            );
                        }

                        if (
                            (result?.type === 1 &&
                                req.body.type === "phone_number") ||
                            (result?.type === 0 && req.body.type === "email")
                        ) {
                            throw new Error(
                                OTP_MESSAGES.REQUIRE_FIELD_IS_INVALID,
                            );
                        }
                        const otp = result?.OTP;
                        if (value !== otp) {
                            await databaseService.OTP.updateOne(
                                {
                                    _id: result._id,
                                },
                                {
                                    $set: {
                                        incorrTimes: result.incorrTimes + 1,
                                    },
                                },
                            );
                            throw new Error(USER_MESSAGES.OTP_IS_INCORRECT);
                        }
                        req.body.user_id = user._id;
                    },
                },
            },
        },
        ["body"],
    ),
);

export const blockPostman = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (
            (req.headers["postman-token"] &&
                (await req.body?.code) === process.env.CODE) ||
            isDeveloperAgent(req.headers["user-agent"] as string)
        ) {
            next();
            // return true
        } else {
            return res.status(403).send("m cook");
            // return false
        }
    } catch (error) {
        console.log(error);
    }
};

export const accessTokenValidator = validate(
    checkSchema(
        {
            authorization: {
                ...paramSchema,
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        const access_token = value.split(" ")[1];
                        if (!access_token) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                                status: HTTP_STATUS.UNAUTHORIZED,
                            });
                        }
                        try {
                            const decoded_authorization = await verifyToken({
                                token: access_token,
                                secretOrPublickey: process.env
                                    .JWT_SECRET_ACCESS_TOKEN as string,
                            });
                            (req as Request).decoded_authorization =
                                decoded_authorization;
                        } catch (error) {
                            throw new ErrorWithStatus({
                                message: capitalize(
                                    (error as JsonWebTokenError).message,
                                ),
                                status: HTTP_STATUS.UNAUTHORIZED,
                            });
                        }
                        return true;
                    },
                },
            },
        },
        ["headers"],
    ),
);

export const refreshTokenValidator = validate(
    checkSchema(
        {
            refresh_token: {
                ...paramSchema,
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        try {
                            const [decoded_refresh_token, refresh_token] =
                                await Promise.all([
                                    verifyToken({
                                        token: value,
                                        secretOrPublickey: process.env
                                            .JWT_SECRET_REFRESH_TOKEN as string,
                                    }),
                                    databaseService.refreshTokens.findOne({
                                        token: value,
                                    }),
                                ]);

                            if (!refresh_token) {
                                throw new ErrorWithStatus({
                                    message:
                                        USER_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
                                    status: HTTP_STATUS.UNAUTHORIZED,
                                });
                            }
                            (req as Request).decoded_refresh_token =
                                decoded_refresh_token;
                        } catch (error) {
                            if (error instanceof JsonWebTokenError) {
                                throw new ErrorWithStatus({
                                    message: capitalize(
                                        (error as JsonWebTokenError).message,
                                    ),
                                    status: HTTP_STATUS.UNAUTHORIZED,
                                });
                            }
                            throw error;
                        }
                        return true;
                    },
                },
            },
        },
        ["body"],
    ),
);

export const verifiedUserValidator = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { status } = req.decoded_authorization as TokenPayload;
    if (status !== UserVerifyStatus.Verified) {
        return next(
            new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_VERIFIED,
                status: HTTP_STATUS.FORBIDDEN,
            }),
        );
    }
    next();
};

export const updateMeValidator = validate(
    checkSchema(
        {
            first_name: { ...paramSchema, optional: true, ...firstnameSchema },
            last_name: { ...paramSchema, optional: true, ...lastnameSchema },
            email: { ...paramSchema, optional: true, ...emailSchema },
            phone_number: {
                ...paramSchema,
                optional: true,
                ...phone_numberSchema,
            },
            avatar_url: { ...paramSchema, optional: true, ...lastnameSchema },
            password: { ...paramSchema, optional: true, ...passwordSchema },
        },
        ["body"],
    ),
);

export const searchAccountValidator = validate(
    // after reach the middleware checkEmailOrPhone, the request body will be modified (assume that email or phone_number is present and valid)
    // so we need to validate the new request body
    /*
        "email_phone": data
        body{
            email: data as string
            type: 'email'
        }

        "email_phone": data
        body{
            phone_number: data as string
            type: 'phone_number'
        }
    */
    checkSchema({
        type: {
            ...paramSchema,
            in: ["body"],
            trim: true,
            notEmpty: {
                errorMessage: "Type is required",
            },
            isString: {
                errorMessage: "Type must be a string",
            },
            isIn: {
                options: [["email", "phone_number"]],
                errorMessage: 'Type must be either "email" or "phone_number"',
            },
        },
        email: {
            ...paramSchema,
            in: ["body"],
            optional: {
                options: {
                    nullable: true,
                    checkFalsy: true,
                },
            },
        },
        phone_number: {
            ...paramSchema,
            in: ["body"],
            optional: {
                options: {
                    nullable: true,
                    checkFalsy: true,
                },
            },
        },
    }),
);

export const refreshTokenCookieValidator = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const value = req.cookies["refresh_token"];

    if (!value) {
        return next(
            new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED,
            }),
        );
    }
    try {
        const [decoded_refresh_token, refresh_token] = await Promise.all([
            verifyToken({
                token: value,
                secretOrPublickey: process.env
                    .JWT_SECRET_REFRESH_TOKEN as string,
            }),
            databaseService.refreshTokens.findOne({
                token: value,
            }),
        ]);

        if (!refresh_token) {
            throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
                status: HTTP_STATUS.UNAUTHORIZED,
            });
        }

        req.decoded_refresh_token = decoded_refresh_token;
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            next(
                new ErrorWithStatus({
                    message: capitalize((error as JsonWebTokenError).message),
                    status: HTTP_STATUS.UNAUTHORIZED,
                }),
            );
        }
        next(error);
    }

    next();
};
