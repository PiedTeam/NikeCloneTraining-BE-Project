import { StatusCodes } from 'http-status-codes'
import { OTP_MESSAGES } from '~/modules/otp/otp.messages'

type ErrorsType = Record<
    string,
    {
        msg: string
        [key: string]: any
    }
>

export class ErrorWithStatus {
    message: string
    status: number
    constructor({ message, status }: { message: string; status: number }) {
        this.message = message
        this.status = status
    }
}

export class EntityError extends ErrorWithStatus {
    errors: ErrorsType
    constructor({ message = OTP_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
        super({ message, status: StatusCodes.UNPROCESSABLE_ENTITY })
        this.errors = errors // gán errors
    }
}
