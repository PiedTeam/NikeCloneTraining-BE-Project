import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParamSchema, check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import validator from 'validator'
import { HTTP_STATUS } from '~/constants/httpStatus'
import databaseService from '~/database/database.services'
import { ErrorEntity } from '~/errors/errors.entityError'
import { ErrorWithStatus } from '~/models/Error'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import { isDeveloperAgent } from '~/utils/agent'
import { encrypt, hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { isValidPhoneNumberForCountry, validate } from '~/utils/validation'
import { OTP_STATUS } from '../otp/otp.enum'
import { NoticeUser, UserVerifyStatus } from './user.enum'
import { LoginRequestBody, TokenPayload } from './user.requests'
import usersService from './user.services'
import 'dotenv/config'

const usernameSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING
    },
    isLength: {
        options: {
            min: 1,
            max: 50
        },
        errorMessage: USER_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_50
    },
    custom: {
        options: (value: string) => {
            if (!/[a-zA-Z]/.test(value)) {
                throw new Error(USER_MESSAGES.USERNAME_MUST_CONTAIN_ALPHABET)
            }
            return true
        }
    }
}

export const emailSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
    },
    isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
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
            icloud_remove_subaddress: true
        }
    }
}

export const phone_numberSchema: ParamSchema = {
    optional: {
        options: {
            nullable: true
        }
    },
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.PHONE_NUMBER_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.PHONE_NUMBER_MUST_BE_STRING
    },
    isMobilePhone: {
        options: ['vi-VN'],
        errorMessage: USER_MESSAGES.PHONE_NUMBER_IS_INVALID
    }
}

const passwordSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
    },
    isStrongPassword: {
        options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
    }
}

const confirmPasswordSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
    },
    isStrongPassword: {
        options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
    },
    custom: {
        options: (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(
                    USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH_PASSWORD
                )
            }
            return true
        }
    }
}

const firstnameSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.FIRST_NAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.FIRST_NAME_MUST_BE_STRING
    },
    isLength: {
        options: {
            min: 1,
            max: 50
        },
        errorMessage: USER_MESSAGES.FIRST_NAME_LENGTH_MUST_BE_FROM_1_TO_50
    }
}

const lastnameSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.LAST_NAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.LAST_NAME_MUST_BE_STRING
    },
    isLength: {
        options: {
            min: 1,
            max: 50
        },
        errorMessage: USER_MESSAGES.LAST_NAME_LENGTH_MUST_BE_FROM_1_TO_50
    }
}

const imageSchema: ParamSchema = {
    optional: true,
    isString: {
        errorMessage: USER_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 400
        },
        errorMessage: USER_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400
    }
}

export const registerValidator = validate(
    checkSchema(
        {
            // username: {
            //     ...usernameSchema,
            //     custom: {
            //         options: async (value) => {
            //             if (!/[a-zA-Z]/.test(value)) {
            //                 throw new Error(
            //                     USER_MESSAGES.USERNAME_MUST_CONTAIN_ALPHABET
            //                 )
            //             }

            //             const isExist =
            //                 await usersService.checkUsernameExist(value)

            //             if (isExist) {
            //                 throw new Error(
            //                     USER_MESSAGES.USERNAME_ALREADY_EXISTS
            //                 )
            //             }
            //             return true
            //         }
            //     }
            // },
            first_name: firstnameSchema,
            last_name: lastnameSchema,
            password: passwordSchema,
            phone_number: {
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value) => {
                        const isExist =
                            await usersService.checkPhoneNumberExist(
                                encrypt(value)
                            )
                        if (isExist) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_IS_ALREADY_EXISTED
                            )
                        }
                        return true
                    }
                }
            },
            email: {
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value) => {
                        const isExist = await usersService.checkEmailExist(
                            encrypt(value)
                        )
                        if (isExist) {
                            throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
                        }
                        return true
                    }
                }
            }
            // confirm_password: confirmPasswordSchema
        },
        ['body']
    )
)

export const loginCheckMissingField = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body as LoginRequestBody
    if (!body.email && !body.phone_number) {
        next(
            new ErrorEntity({
                message: USER_MESSAGES.UNPROCESSABLE_ENTITY,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                data: {
                    field: { msg: USER_MESSAGES.FIELD_IS_REQUIRED }
                }
            })
        )
    }
    next()
}

export const checkEmailOrPhone = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body as ParamsDictionary
    const email_phone = body.email_phone

    if (validator.isEmail(email_phone)) {
        req.body.email = email_phone
        req.body.type = 'email'
    } else if (isValidPhoneNumberForCountry(email_phone, 'VN')) {
        req.body.phone_number = email_phone
        req.body.type = 'phone_number'
    } else {
        next(
            new ErrorEntity({
                message: USER_MESSAGES.UNPROCESSABLE_ENTITY,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                data: { field: { msg: USER_MESSAGES.FIELD_ERROR_FORMAT } }
            })
        )
    }
    delete req.body.email_phone
    next()
}

export const loginValidator = validate(
    checkSchema(
        {
            // username: {
            //     optional: true,
            //     ...usernameSchema,
            //     custom: {
            //         options: async (value, { req }) => {
            //             if (!/[a-zA-Z]/.test(value)) {
            //                 throw new Error(
            //                     USER_MESSAGES.USERNAME_MUST_CONTAIN_ALPHABET
            //                 )
            //             }

            //             const user = await databaseService.users.findOne({
            //                 username: value
            //             })
            //             if (user === null) {
            //                 throw new Error(USER_MESSAGES.USERNAME_NOT_FOUND)
            //             }
            //             if (user.password !== hashPassword(req.body.password)) {
            //                 throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG)
            //             }
            //             req.user = user
            //             return true
            //         }
            //     }
            // },
            email: {
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            email: encrypt(value)
                        })
                        if (user === null) {
                            throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
                        }
                        if (user.password !== hashPassword(req.body.password)) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG)
                        }
                        ;(req as Request).user = user
                        return true
                    }
                }
            },
            phone_number: {
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            phone_number: encrypt(value)
                        })
                        if (user === null) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_NOT_FOUND
                            )
                        }
                        if (user.password !== hashPassword(req.body.password)) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG)
                        }
                        ;(req as Request).user = user
                        return true
                    }
                }
            },
            password: {
                trim: true,
                notEmpty: {
                    errorMessage: 'Password is required'
                },
                isString: {
                    errorMessage: 'Password must be a string'
                }
            }
        },
        ['body']
    )
)

export const forgotPasswordValidator = validate(
    checkSchema(
        {
            email: {
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            email: encrypt(value)
                        })
                        if (user === null) {
                            throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
                        }
                        req.user = user
                        return true
                    }
                }
            },
            phone_number: {
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            phone_number: encrypt(value)
                        })
                        if (user === null) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_NOT_FOUND
                            )
                        }
                        req.user = user
                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const verifyForgotPasswordOTPValidator = validate(
    checkSchema(
        {
            forgot_password_otp: {
                trim: true,
                custom: {
                    options: async (value, { req }) => {
                        if (!value) {
                            throw new Error(
                                USER_MESSAGES.FORGOT_PASSWORD_OTP_IS_REQUIRED
                            )
                        }
                        const user =
                            req.body.type === 'email'
                                ? await databaseService.users.findOne({
                                      email: encrypt(req.body.email)
                                  })
                                : await databaseService.users.findOne({
                                      phone_number: encrypt(
                                          req.body.phone_number
                                      )
                                  })
                        if (!user) {
                            throw new Error(USER_MESSAGES.USER_NOT_FOUND)
                        }
                        const result = await databaseService.OTP.findOne({
                            user_id: user._id,
                            status: OTP_STATUS.Available
                        })
                        if (!result) {
                            throw new Error(USER_MESSAGES.OTP_NOT_FOUND)
                        }
                        if (result.incorrTimes >= 3) {
                            await databaseService.users.updateOne(
                                { _id: user._id },
                                { $set: { notice: NoticeUser.Warning } }
                            )
                            await databaseService.OTP.updateOne(
                                { _id: result._id },
                                { $set: { status: OTP_STATUS.Unavailable } }
                            )
                            throw new Error(
                                USER_MESSAGES.OVER_TIMES_REQUEST_METHOD
                            )
                        }
                        if (
                            (result?.type === 1 &&
                                req.body.type === 'phone_number') ||
                            (result?.type === 0 && req.body.type === 'email')
                        ) {
                            throw new Error(
                                USER_MESSAGES.REQUIRE_FIELD_IS_INVALID
                            )
                        }
                        const otp = result?.OTP
                        if (value !== otp) {
                            await databaseService.OTP.updateOne(
                                {
                                    _id: result._id
                                },
                                {
                                    $set: {
                                        incorrTimes: result.incorrTimes + 1
                                    }
                                }
                            )
                            console.log(result)
                            throw new Error(USER_MESSAGES.OTP_IS_INCORRECT)
                        }
                        req.body.user_id = user._id
                    }
                }
            }
        },
        ['body']
    )
)

export const resetPasswordValidator = validate(
    checkSchema(
        {
            password: passwordSchema,
            confirm_password: confirmPasswordSchema,
            email_phone: {
                notEmpty: {
                    errorMessage: USER_MESSAGES.EMAIL_PHONE_IS_REQUIRED
                },
                isString: {
                    errorMessage: USER_MESSAGES.EMAIL_PHONE_MUST_BE_STRING
                }
            }
        },
        ['body']
    )
)

export const checkNewPasswordValidator = validate(
    checkSchema(
        {
            password: {
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            _id: req.body.user_id
                        })
                        if (user?.password === hashPassword(value)) {
                            throw new Error(
                                USER_MESSAGES.NEW_PASSWORD_MUST_BE_NEW
                            )
                        }
                    }
                }
            }
        },
        ['body']
    )
)

export const changePasswordValidator = validate(
    checkSchema(
        {
            old_password: {
                ...passwordSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user_info =
                            req.decoded_authorization as TokenPayload
                        const user = await databaseService.users.findOne({
                            _id: new ObjectId(user_info.user_id),
                            password: hashPassword(value)
                        })
                        if (!user) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG)
                        }
                        req.body.user_id = user._id
                        delete req.decoded_authorization
                    }
                }
            },
            new_password: {
                ...passwordSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user_info =
                            req.decoded_authorization as TokenPayload
                        const user = await databaseService.users.findOne({
                            _id: new ObjectId(user_info.user_id),
                            password: hashPassword(value)
                        })

                        if (user?.password === hashPassword(value)) {
                            throw new Error(
                                USER_MESSAGES.NEW_PASSWORD_MUST_BE_NEW
                            )
                        }
                    }
                }
            }
        },
        ['body']
    )
)

export const verifyAccountValidator = validate(
    checkSchema(
        {
            email: {
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            email: encrypt(value)
                        })
                        if (user === null) {
                            throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
                        }
                        req.user = user
                        return true
                    }
                }
            },
            phone_number: {
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            phone_number: encrypt(value)
                        })
                        if (user === null) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_NOT_FOUND
                            )
                        }
                        req.user = user
                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const verifyAccountOTPValidator = validate(
    checkSchema({
        verify_account_otp: {
            trim: true,
            custom: {
                options: async (value, { req }) => {
                    if (!value) {
                        throw new Error(
                            USER_MESSAGES.VERIFY_ACCOUNT_OTP_IS_REQUIRED
                        )
                    }
                    const user =
                        req.body.type === 'email'
                            ? await databaseService.users.findOne({
                                  email: encrypt(req.body.email)
                              })
                            : await databaseService.users.findOne({
                                  phone_number: encrypt(req.body.phone_number)
                              })
                    if (!user) {
                        throw new Error(USER_MESSAGES.USER_NOT_FOUND)
                    }
                    const result = await databaseService.OTP.findOne({
                        user_id: user._id,
                        status: OTP_STATUS.Available
                    })
                    if (!result) {
                        throw new Error(USER_MESSAGES.OTP_NOT_FOUND)
                    }
                    if (
                        (result?.type === 1 &&
                            req.body.type === 'phone_number') ||
                        (result?.type === 0 && req.body.type === 'email')
                    ) {
                        throw new Error(USER_MESSAGES.REQUIRE_FIELD_IS_INVALID)
                    }
                    const otp = result?.OTP
                    if (value !== otp) {
                        throw new Error(USER_MESSAGES.OTP_IS_INCORRECT)
                    }
                    req.body.user_id = user._id
                }
            }
        }
    })
)
export const blockPostman = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (
            (req.headers['postman-token'] &&
                (await req.body?.code) === process.env.CODE) ||
            isDeveloperAgent(req.headers['user-agent'] as string)
        ) {
            next()
            // return true
        } else {
            return res.status(403).send('m cook')
            // return false
        }
    } catch (error) {
        console.log(error)
    }
}

export const accessTokenValidator = validate(
    checkSchema(
        {
            authorization: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        const access_token = value.split(' ')[1]
                        if (!access_token) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                                status: HTTP_STATUS.UNAUTHORIZED
                            })
                        }
                        try {
                            const decoded_authorization = await verifyToken({
                                token: access_token,
                                secretOrPublickey: process.env
                                    .JWT_SECRET_ACCESS_TOKEN as string
                            })
                            ;(req as Request).decoded_authorization =
                                decoded_authorization
                        } catch (error) {
                            throw new ErrorWithStatus({
                                message: capitalize(
                                    (error as JsonWebTokenError).message
                                ),
                                status: HTTP_STATUS.UNAUTHORIZED
                            })
                        }
                        return true
                    }
                }
            }
        },
        ['headers']
    )
)

export const refreshTokenValidator = validate(
    checkSchema(
        {
            refresh_token: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        try {
                            const [decoded_refresh_token, refresh_token] =
                                await Promise.all([
                                    verifyToken({
                                        token: value,
                                        secretOrPublickey: process.env
                                            .JWT_SECRET_REFRESH_TOKEN as string
                                    }),
                                    databaseService.refreshTokens.findOne({
                                        token: value
                                    })
                                ])

                            if (!refresh_token) {
                                throw new ErrorWithStatus({
                                    message:
                                        USER_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
                                    status: HTTP_STATUS.UNAUTHORIZED
                                })
                            }
                            ;(req as Request).decoded_refresh_token =
                                decoded_refresh_token
                        } catch (error) {
                            if (error instanceof JsonWebTokenError) {
                                throw new ErrorWithStatus({
                                    message: capitalize(
                                        (error as JsonWebTokenError).message
                                    ),
                                    status: HTTP_STATUS.UNAUTHORIZED
                                })
                            }
                            throw error
                        }
                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const verifiedUserValidator = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { status } = req.decoded_authorization as TokenPayload
    if (status !== UserVerifyStatus.Verified) {
        return next(
            new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_VERIFIED,
                status: HTTP_STATUS.FORBIDDEN
            })
        )
    }
    next()
}

export const updateMeValidator = validate(
    checkSchema(
        {
            // username: { optional: true, ...usernameSchema },
            first_name: { optional: true, ...firstnameSchema },
            last_name: { optional: true, ...lastnameSchema },
            email: {
                optional: true,
                ...emailSchema
            },
            phone_number: {
                optional: true,
                ...phone_numberSchema
            },
            avatar_url: { optional: true, ...lastnameSchema }
        },
        ['body']
    )
)

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
            in: ['body'],
            trim: true,
            notEmpty: {
                errorMessage: 'Type is required'
            },
            isString: {
                errorMessage: 'Type must be a string'
            },
            isIn: {
                options: [['email', 'phone_number']],
                errorMessage: 'Type must be either "email" or "phone_number"'
            }
        },
        email: {
            in: ['body'],
            optional: {
                options: {
                    nullable: true,
                    checkFalsy: true
                }
            }
        },
        phone_number: {
            in: ['body'],
            optional: {
                options: {
                    nullable: true,
                    checkFalsy: true
                }
            }
        }
    })
)
