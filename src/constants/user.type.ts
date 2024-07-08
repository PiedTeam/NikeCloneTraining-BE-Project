import { ObjectId } from "mongodb";
import { UserRole, UserVerifyStatus } from "~/modules/user/user.enum";
import User from "~/modules/user/user.schema";

export interface UserList {
    _id: ObjectId;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    role: UserRole;
    status: UserVerifyStatus;
}

export type UserAvatarInfo = Pick<User, "_id" | "avatar_url">;
