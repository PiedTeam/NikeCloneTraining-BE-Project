import { checkSchema } from "express-validator";
import { validate } from "~/utils/validation";
import { emailSchema, phone_numberSchema } from "../user/user.middlewares";

export const phoneNumberValidator = validate(
    checkSchema(
        {
            phone_number: {
                ...phone_numberSchema,
            },
        },
        ["body"],
    ),
);

export const emailValidator = validate(
    checkSchema(
        {
            email: {
                ...emailSchema,
            },
        },
        ["body"],
    ),
);
