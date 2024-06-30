import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema";
import { StatusCodes } from "http-status-codes";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { ErrorEntity, ErrorWithStatus } from "~/errors/errors.entityError";

export const validate = (
    validations: RunnableValidationChains<ValidationChain>,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await validations.run(req);

        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        const errorsObject = errors.mapped();
        const errorEntity = new ErrorEntity({ data: {} });

        Object.keys(errorsObject).forEach((key) => {
            const { msg } = errorsObject[key];
            if (
                msg instanceof ErrorWithStatus &&
                msg.status !== StatusCodes.UNPROCESSABLE_ENTITY
            ) {
                return next(msg);
            }

            errorEntity.data[key] = msg;
        });

        // Throw for defaultErrorHandler
        next(errorEntity);
    };
};

export function isValidPhoneNumberForCountry(
    phone_number: string,
    country: CountryCode | undefined,
) {
    const phoneNumber = parsePhoneNumberFromString(phone_number, {
        defaultCountry: country,
    });
    if (!phoneNumber) {
        return false;
    }
    if (phoneNumber.country !== country) {
        return false;
    }
    return phoneNumber.isValid();
}
