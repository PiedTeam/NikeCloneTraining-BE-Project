import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/modules/user/user.messages'

type ErrorsType = Record<string, { msg: string; [key: string]: string }>

interface IErrorWithStatus {
    message: string
    status: number
}

export class ErrorWithStatus implements IErrorWithStatus {
    message: string
    status: number
    constructor({ message, status }: IErrorWithStatus) {
        this.message = message
        this.status = status
    }
}

export class ErrorEntity extends ErrorWithStatus {
    data: ErrorsType
    constructor({
        message = USER_MESSAGES.UNPROCESSABLE_ENTITY,
        status = HTTP_STATUS.UNPROCESSABLE_ENTITY,
        data
    }: {
        message?: string
        status?: number
        data: ErrorsType
    }) {
        super({ message, status })
        this.data = data
    }
}
