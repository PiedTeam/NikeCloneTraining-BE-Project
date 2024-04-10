import { USER_MESSAGES } from '~/modules/user/user.messages'
import usersService from './user.services'
import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from '~/utils/validation'

const usernameSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 50
        },
        errorMessage: USER_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_50
    }
}

const emailSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
    },
    trim: true,
    isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
    }
}

const phone_numberSchema: ParamSchema = {
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
    notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
    },
    trim: true,
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
    notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
    },
    trim: true,
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
    notEmpty: {
        errorMessage: USER_MESSAGES.FIRST_NAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.FIRST_NAME_MUST_BE_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 50
        },
        errorMessage: USER_MESSAGES.FIRST_NAME_LENGTH_MUST_BE_FROM_1_TO_50
    }
}

const lastnameSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USER_MESSAGES.LAST_NAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USER_MESSAGES.LAST_NAME_MUST_BE_STRING
    },
    trim: true,
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
            username: usernameSchema,
            first_name: firstnameSchema,
            last_name: lastnameSchema,
            email: emailSchema,
            password: passwordSchema,
            confirm_password: confirmPasswordSchema,
            phone_number: phone_numberSchema
        },
        ['body']
    )
)
