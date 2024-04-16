import { USER_MESSAGES } from '~/modules/user/user.messages'
import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersService from './user.services'
import { encrypt, hashPassword } from '~/utils/crypto'
import databaseService from '~/database/database.services'
import { Request, Response, NextFunction } from 'express'
import { LoginRequestBody } from './user.requests'
import { ParamsDictionary } from 'express-serve-static-core'

const usernameSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING
    },
    custom: {
        options: (value: string) => {
            if (!/[a-zA-Z]/.test(value)) {
                throw new Error(USER_MESSAGES.USERNAME_MUST_CONTAIN_ALPHABET)
            }
            return true
        }
    },
    isLength: {
        options: {
            min: 1,
            max: 50
        },
        errorMessage: USER_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_50
    }
}

const emailSchema: ParamSchema = {
    trim: true,
    notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
    },
    isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
    }
}

const phone_numberSchema: ParamSchema = {
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
            if (!value === req.body.password) {
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

export const registerValidator = validate(
    checkSchema(
        {
            username: {
                custom: {
                    options: async (value) => {
                        const isExist =
                            await usersService.checkUsernameExist(value)

                        if (isExist) {
                            throw new Error(
                                USER_MESSAGES.USERNAME_ALREADY_EXISTS
                            )
                        }
                        return true
                    }
                },
                ...usernameSchema
            },
            first_name: firstnameSchema,
            last_name: lastnameSchema,
            password: passwordSchema,
            confirm_password: confirmPasswordSchema
        },
        ['body']
    )
)

export const loginValidator = validate(
    checkSchema(
        {
            username: {
                optional: true,
                ...usernameSchema,
                custom: {
                    options: async (value, { req }) => {
                        const user = await databaseService.users.findOne({
                            username: value
                        })
                        if (user === null) {
                            throw new Error(USER_MESSAGES.USERNAME_NOT_FOUND)
                        }
                        if (user.password !== hashPassword(req.body.password)) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG)
                        }
                        req.user = user
                        return true
                    }
                }
            },
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
                        if (user.password !== hashPassword(req.body.password)) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG)
                        }
                        req.user = user
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
