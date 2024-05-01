import { ParamSchema, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { USER_MESSAGES } from '../user/user.messages'

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
export const registerPasswordValidator = validate(
    checkSchema(
        {
            password: passwordSchema
            // confirm_password: confirmPasswordSchema
        },
        ['body']
    )
)
