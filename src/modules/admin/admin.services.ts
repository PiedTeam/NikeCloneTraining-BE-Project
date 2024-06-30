import { ObjectId } from "mongodb";
import databaseService from "~/database/database.services";
import { ErrorWithStatus } from "~/errors/errors.entityError";
import { StatusCodes } from "http-status-codes";
import { ADMIN_MESSAGES } from "./admin.messages";
import { CreateEmployeeReqBody, UpdateAccountReqBody } from "./admin.requests";
import Employee from "../employee/employee.schema";
import { capitalizePro } from "~/utils/capitalize";
import { create, omit } from "lodash";
import decrypt, { encrypt, hashPassword } from "~/utils/crypto";
import { TokenType, UserRole } from "../user/user.enum";
import { signToken, verifyToken } from "~/utils/jwt";
import RefreshToken from "../refreshToken/refreshToken.schema";
import { EmployeeRole } from "./admin.enum";
import { UserList } from "~/constants/user.type";

class AdminService {
    private decodeRefreshToken(refresh_token: string) {
        return verifyToken({
            token: refresh_token,
            secretOrPublickey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
        });
    }

    private signAccessToken(user_id: string, role: EmployeeRole) {
        return signToken({
            payload: {
                user_id: user_id,
                token_type: TokenType.Access,
                role,
            },
            options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
        });
    }

    private signRefreshToken({
        user_id,
        exp,
    }: {
        user_id: string;
        exp?: number;
    }) {
        if (exp) {
            return signToken({
                payload: {
                    user_id,
                    token_type: TokenType.Refresh,
                    exp,
                },
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            });
        } else {
            return signToken({
                payload: {
                    user_id,
                    token_type: TokenType.Refresh,
                },
                options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_DAYS },
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            });
        }
    }

    private signAccessAndRefreshToken(user_id: string, role: EmployeeRole) {
        return Promise.all([
            this.signAccessToken(user_id, role),
            this.signRefreshToken({ user_id }),
        ]);
    }

    async findUserById(user_id: string) {
        const emp = await databaseService.employee.findOne({
            _id: new ObjectId(user_id),
        });

        if (!emp)
            throw new ErrorWithStatus({
                message: ADMIN_MESSAGES.EMPLOYEE_NOT_FOUND,
                status: StatusCodes.NOT_FOUND,
            });

        return emp;
    }

    async getRole(user_id: string) {
        const user = await this.findUserById(user_id);
        return user?.role;
    }

    async checkPhoneNumberExist(phone_number: string) {
        const emp = await databaseService.employee.findOne({ phone_number });
        return Boolean(emp);
    }

    async checkEmailExist(email: string) {
        const emp = await databaseService.employee.findOne({ email });
        return Boolean(emp);
    }

    async createEmp(payload: CreateEmployeeReqBody) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const emp = await databaseService.employee.insertOne(
            new Employee({
                ...(omit(payload, ["email_phone"]) as CreateEmployeeReqBody),
                first_name: capitalizePro(payload.first_name),
                last_name: capitalizePro(payload.last_name),
                email: payload.email?.length ? encrypt(payload.email) : "",
                password: payload.password?.length
                    ? hashPassword(payload.password)
                    : hashPassword(randomPassword), // admin k set thì random password cho emp tự set password thông qua email
                phone_number: payload.phone_number?.length
                    ? encrypt(payload.phone_number)
                    : "",
                contract_signed_date: new Date(),
                contract_expired_date: payload.contract_expired_date
                    ? new Date(payload.contract_expired_date)
                    : new Date(new Date().setMonth(new Date().getMonth() + 6)),
            }),
        );

        return await this.findUserById(emp.insertedId.toString());
    }

    async login({ user_id, role }: { user_id: string; role: EmployeeRole }) {
        const [access_token, refresh_token] =
            await this.signAccessAndRefreshToken(user_id, role);

        const { iat, exp } = await this.decodeRefreshToken(refresh_token);

        await databaseService.refreshTokens.insertOne(
            new RefreshToken({
                token: refresh_token,
                user_id: new ObjectId(user_id),
                iat,
                exp,
            }),
        );

        return { access_token, refresh_token };
    }

    async updateAccountById(id: string, payload: UpdateAccountReqBody) {
        return await databaseService.employee.findOneAndUpdate(
            { _id: new ObjectId(id) },
            [
                {
                    $set: {
                        ...omit(payload, ["email_phone"]),
                        updated_at: "$$NOW",
                    },
                },
            ],

            {
                projection: { updated_at: 0, created_at: 0 },
                returnDocument: "after",
            },
        );
    }

    async getListAccountEmployee() {
        const listEmployee = await databaseService.employee
            .find<UserList>(
                {
                    role: 2,
                },
                {
                    projection: {
                        _id: 1,
                        first_name: 1,
                        last_name: 1,
                        email: 1,
                        phone_number: 1,
                        role: 1,
                    },
                },
            )
            .toArray();
        const result = listEmployee.map((user) => {
            if (user.email && user.phone_number) {
                const email = decrypt(user.email);
                const phoneNumber = decrypt(user.phone_number);
                return { ...user, email: email, phone_number: phoneNumber };
            } else if (user.email) {
                const email = decrypt(user.email);
                return { ...user, email: email };
            } else {
                const phoneNumber = decrypt(user.phone_number);
                return { ...user, phone_number: phoneNumber };
            }
        });
        return result;
    }
}

const adminService = new AdminService();
export default adminService;
