import Employee from "./modules/employee/employee.schema";
import { TokenPayload } from "./modules/user/user.requests";
import User from "./modules/user/user.schema";
import { Request } from "express";

declare module "express-serve-static-core" {
    interface Request {
        user?: User;
        emp?: Employee;
        decoded_authorization?: TokenPayload;
        decoded_refresh_token?: TokenPayload;
    }
}
