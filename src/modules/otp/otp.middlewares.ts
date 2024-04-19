import { checkSchema, ParamSchema } from 'express-validator'
import { USER_MESSAGES } from '../user/user.messages'
import { validate } from '~/utils/validation'
import usersService from '../user/user.services'
import { phone_numberSchema, emailSchema } from '../user/user.middlewares'

export const phoneNumberValidator = validate(
    checkSchema({
        phone_number: {
            ...phone_numberSchema,
            custom: {
                options: async (value) => {
                    const isExist = await usersService.checkPhoneExist(value)
                    if (!isExist) {
                        throw new Error(
                            USER_MESSAGES.PHONE_NUMBER_IS_NOT_REGISTERED
                        )
                    }
                    return true
                }
            }
        }
    })
)

export const emailValidator = validate(
    checkSchema({
        email: {
            ...emailSchema,
            custom: {
                options: async (value) => {
                    const isExist = await usersService.checkEmailExist(value)
                    if (!isExist) {
                        throw new Error(USER_MESSAGES.EMAIL_IS_NOT_REGISTERED)
                    }
                    return true
                }
            }
        }
    })
)
