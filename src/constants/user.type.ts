import { ObjectId } from 'mongodb'
import { UserRole, UserVerifyStatus } from '~/modules/user/user.enum'

export type UserList = {
    _id: ObjectId
    first_name: string
    last_name: string
    phone_number: string
    email: string
    role: UserRole
    status: UserVerifyStatus
}
