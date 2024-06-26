import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "../user/user.requests";
import { ErrorWithStatus } from "~/errors/errors.entityError";
import { USER_MESSAGES } from "../user/user.messages";
import { StatusCodes } from "http-status-codes";
import adminService from "./admin.services";
import { ADMIN_MESSAGES } from "./admin.messages";
import { validate } from "~/utils/validation";
import { checkSchema } from "express-validator";
import {
    paramSchema,
    firstnameSchema,
    lastnameSchema,
    phone_numberSchema,
    emailSchema,
    passwordSchema,
} from "../user/user.middlewares";
import { encrypt, hashPassword } from "~/utils/crypto";
import databaseService from "~/database/database.services";
import { EmployeeRole } from "./admin.enum";

export const checkRoleAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { user_id } = req.decoded_authorization as TokenPayload;
    const role = await adminService.getRole(user_id);

    if (role !== EmployeeRole.Admin) {
        throw new ErrorWithStatus({
            message: ADMIN_MESSAGES.NOT_AN_ADMIN,
            status: StatusCodes.UNAUTHORIZED,
        });
    }
    next();
};

export const createEmpValidator = validate(
    checkSchema(
        {
            first_name: { ...paramSchema, ...firstnameSchema },
            last_name: { ...paramSchema, ...lastnameSchema },
            phone_number: {
                ...paramSchema,
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value) => {
                        const isExist =
                            await adminService.checkPhoneNumberExist(
                                encrypt(value),
                            );
                        if (isExist) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_IS_ALREADY_EXISTED,
                            );
                        }
                        return true;
                    },
                },
            },
            email: {
                ...paramSchema,
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value) => {
                        const isExist = await adminService.checkEmailExist(
                            encrypt(value),
                        );
                        if (isExist) {
                            throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
                        }
                        return true;
                    },
                },
            },
            //...
        },
        ["body"],
    ),
);

export const loginValidator = validate(
    checkSchema(
        {
            email: {
                ...paramSchema,
                optional: true,
                ...emailSchema,
                custom: {
                    options: async (value, { req }) => {
                        const emp = await databaseService.employee.findOne({
                            email: encrypt(value),
                        });

                        if (!emp) {
                            throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND);
                        }

                        if (emp.password !== hashPassword(req.body.password)) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG);
                        }
                        req.emp = emp;

                        return true;
                    },
                },
            },
            phone_number: {
                ...paramSchema,
                optional: true,
                ...phone_numberSchema,
                custom: {
                    options: async (value, { req }) => {
                        const emp = await databaseService.employee.findOne({
                            phone_number: encrypt(value),
                        });

                        if (!emp) {
                            throw new Error(
                                USER_MESSAGES.PHONE_NUMBER_NOT_FOUND,
                            );
                        }

                        if (emp.password !== hashPassword(req.body.password)) {
                            throw new Error(USER_MESSAGES.PASSWORD_IS_WRONG);
                        }
                        (req as Request).emp = emp;

                        return true;
                    },
                },
            },
            password: {
                ...paramSchema,
                trim: true,
                notEmpty: { errorMessage: "Password is required" },
                isString: { errorMessage: "Password must be a string" },
            },
        },
        ["body"],
    ),
);

export const updateAccValidator = validate(
    checkSchema({
        first_name: {
            ...paramSchema,
            ...firstnameSchema,
            optional: true,
        },
        last_name: {
            // ...paramSchema,
            ...lastnameSchema,
            optional: true,
        },
        phone_number: {
            ...paramSchema,
            optional: true,
            ...phone_numberSchema,
            custom: {
                options: async (value) => {
                    const isExist = await adminService.checkPhoneNumberExist(
                        encrypt(value),
                    );

                    if (isExist) {
                        throw new Error(
                            USER_MESSAGES.PHONE_NUMBER_IS_ALREADY_EXISTED,
                        );
                    }
                    return true;
                },
            },
        },
        email: {
            ...paramSchema,
            optional: true,
            ...emailSchema,
            custom: {
                options: async (value) => {
                    const isExist = await adminService.checkEmailExist(
                        encrypt(value),
                    );
                    if (isExist) {
                        throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
                    }
                    return true;
                },
            },
        },
        password: { ...paramSchema, ...passwordSchema, optional: true },
        role: {
            optional: true,
            isNumeric: true,
            isIn: {
                options: [EmployeeRole],
                errorMessage: "Invalid role",
            },
        },
        salary: { optional: true, isNumeric: true },
        attendance_date: { optional: true, isNumeric: true },
        CV: { optional: true, isString: true },
        avatar_url: { optional: true, isString: true },
        contract_signed_date: {
            optional: true,
            isISO8601: { options: { strict: true, strictSeparator: true } },
            errorMessage: "is_ISO8601",
        },
        contract_expired_date: {
            optional: true,
            isISO8601: { options: { strict: true, strictSeparator: true } },
            errorMessage: "is_ISO8601",
        },
    }),
);
