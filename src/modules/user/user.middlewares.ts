import { USERS_MESSAGES } from '~/modules/user/user.messages'
import usersService from './user.services'
import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
    },
    isLength: {
        options: {
            min: 8,
            max: 50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
    },
    isStrongPassword: {
        options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
    }
}
const confirmPasswordSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
    },
    isLength: {
        options: {
            min: 8,
            max: 50
        },
        errorMessage:
            USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
    },
    isStrongPassword: {
        options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
            // returnScore: true
            //true: trả về độ mạnh của password theo thang điểm 10
            //false: chỉ trả là mạnh hay yếu
        },
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom: {
        options: (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(
                    USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD
                )
            }
            return true
        }
    }
}
const usernameSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 100
        },
        errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_100
    }
}
const firstnameSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.FIRST_NAME_IS_REQUIRED
    },

    isString: {
        errorMessage: USERS_MESSAGES.FIRST_NAME_MUST_BE_A_STRING
    },

    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 100
        },
        errorMessage: USERS_MESSAGES.FIRST_NAME_LENGTH_MUST_BE_FROM_1_TO_100
    }
}
const lastnameSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.LAST_NAME_IS_REQUIRED
    },

    isString: {
        errorMessage: USERS_MESSAGES.LAST_NAME_MUST_BE_A_STRING
    },

    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 100
        },
        errorMessage: USERS_MESSAGES.LAST_NAME_LENGTH_MUST_BE_FROM_1_TO_100
    }
}
const emailSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
    },
    isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
    },
    trim: true,
    custom: {
        options: async (value, { req }) => {
            const isExist = await usersService.checkEmailExist(value)
            if (isExist) {
                throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
        }
    }
}

export const registerValidator = validate(
    checkSchema(
        {
            username: usernameSchema,
            first_name: firstnameSchema,
            last_name: lastnameSchema,
            email: emailSchema,
            password: passwordSchema,
            confirm_password: confirmPasswordSchema
        },
        ['body']
    )
)
