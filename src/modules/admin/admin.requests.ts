import { EmployeeRole } from './admin.enum'

export interface CreateEmployeeReqBody {
    first_name: string
    last_name: string
    phone_number: string
    email: string
    password: string
    role: EmployeeRole
    created_at: Date
    updated_at: Date
    salary: number
    attendance_date: number // ngày chấm công
    // CV: string
    // avatar_url: string
    contract_signed_date: Date
    contract_expired_date: Date
}

export interface UpdateAccountReqBody {
    first_name?: string
    last_name?: string
    phone_number?: string
    email?: string
    password?: string
    role?: EmployeeRole
    salary?: number
    attendance_date?: number
    // CV?: string
    // avatar_url?: string
    contract_signed_date?: Date
    contract_expired_date?: Date
}
