import { checkSchema } from 'express-validator'
import validator from 'validator'
import { NextFunction, Request, Response } from 'express'
import 'dotenv/config'
import { validate } from '~/utils/validation'
import admin from '~/config/firebase.config'
import { ErrorWithStatus } from '~/models/Error'
import { ErrorEntity } from '~/errors/errors.entityError'
import { OAUTH_MESSAGES } from './oauth.messages'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const decodeToken = validate(
    checkSchema(
        {
            authorization: {
                custom: {
                    options: async (value, { req }) => {
                        const token = value.split(' ')[1]

                        const decodeValue = await admin
                            .auth()
                            .verifyIdToken(token)

                        console.log('decodeValue', decodeValue)

                        if (!decodeValue) {
                            throw new ErrorWithStatus({
                                message: OAUTH_MESSAGES.UNAUTHORIZED,
                                status: HTTP_STATUS.UNAUTHORIZED
                            })
                        }
                        req.body = decodeValue
                        return true
                    }
                }
            }
        },
        ['headers']
    )
)
