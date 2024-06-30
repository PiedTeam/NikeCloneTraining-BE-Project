import { ObjectId } from "mongodb";
import { EmployeeRole } from "../admin/admin.enum";

interface EmployeeType {
    _id?: ObjectId;
    first_name: string;
    last_name: string;
    phone_number?: string;
    email?: string;
    password: string;
    role?: EmployeeRole;
    created_at?: Date;
    updated_at?: Date;
    salary?: number;
    attendance_date?: number; // ngày chấm công
    CV?: string;
    avatar_url?: string;
    contract_signed_date?: Date;
    contract_expired_date?: Date;
}

export default class Employee {
    _id?: ObjectId;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    email: string;
    role?: EmployeeRole;
    created_at?: Date;
    updated_at?: Date;
    salary?: number; // theo giờ
    attendance_date?: number; // ngày chấm công
    CV?: string;
    avatar_url?: string;
    contract_signed_date?: Date;
    contract_expired_date?: Date;
    constructor(employee: EmployeeType) {
        const date = new Date();
        this._id = employee._id || new ObjectId();
        this.first_name = employee.first_name || "";
        this.last_name = employee.last_name || "";
        this.phone_number = employee.phone_number || "";
        this.password = employee.password;
        this.email = employee.email || "";
        this.role = employee.role || EmployeeRole.Sales;
        this.created_at = employee.created_at || date;
        this.updated_at = employee.updated_at || date;
        this.salary = employee.salary || 20; // cho lương cơ bản $20/h
        this.attendance_date = employee.attendance_date || 0;
        this.CV = employee.CV || "";
        this.avatar_url = employee.avatar_url || "";
        this.contract_signed_date = employee.contract_signed_date || date;
        // 6 tháng sau ngày ký hợp đồng tức là nếu đang là 20/10/2021 thì hợp đồng sẽ hết hạn vào 20/04/2022
        this.contract_expired_date = employee.contract_expired_date || date;
    }
}
