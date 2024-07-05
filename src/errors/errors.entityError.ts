import { HTTP_STATUS } from "~/constants/httpStatus";
import { USER_MESSAGES } from "~/modules/user/user.messages";

type ErrorsType = Record<string, { msg: string; [key: string]: string }>;

interface IErrorWithStatus {
    from?: string; // Make sure the from field is optional
    message: string;
    status: number;
}

export class ErrorWithStatus implements IErrorWithStatus {
    from?: string; // Include the from field here
    message: string;
    status: number;

    // Adjusted constructor to handle the from field
    constructor({ from, message, status }: IErrorWithStatus) {
        this.from = from;
        this.message = message;
        this.status = status;
    }
}

export class ProtectRouterError extends ErrorWithStatus {
    constructor({ message, status }: IErrorWithStatus) {
        super({ from: "ProtectRouterError", message, status });
    }
}

export class ErrorEntity extends ErrorWithStatus {
    data: ErrorsType;
    constructor({
        message = USER_MESSAGES.UNPROCESSABLE_ENTITY,
        status = HTTP_STATUS.UNPROCESSABLE_ENTITY,
        data,
    }: {
        message?: string;
        status?: number;
        data: ErrorsType;
    }) {
        super({ message, status });
        this.data = data;
    }
}
