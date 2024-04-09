import { ObjectId } from 'mongodb'
import { UserRole, UserVerifyStatus } from './user.enum'

interface UserType {
    _id?: ObjectId
    username: string
    first_name: string
    last_name: string
    phone_number: string
    password: string
    email: string
    role: UserRole
    created_at?: Date
    updated_at?: Date
    status?: UserVerifyStatus
    avatar_url?: string
}

class User {
    _id?: ObjectId
    username: string
    first_name: string
    last_name: string
    phone_number: string
    password: string
    email: string
    role: UserRole
    created_at: Date
    updated_at: Date
    status: UserVerifyStatus
    avatar_url: string
    constructor(user: UserType) {
        const date = new Date()
        this._id = user._id || new ObjectId()
        this.username = user.username || ''
        this.first_name = user.first_name || ''
        this.last_name = user.last_name || ''
        this.phone_number = user.phone_number || ''
        this.password = user.password
        this.email = user.email || ''
        this.role = user.role
        this.created_at = user.created_at || date
        this.updated_at = user.updated_at || date
        this.status = user.status || UserVerifyStatus.Unverified
        this.avatar_url = user.avatar_url || ''
    }
}

export default User
