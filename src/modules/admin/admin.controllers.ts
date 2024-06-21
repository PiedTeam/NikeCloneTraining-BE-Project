import { NextFunction, Request, Response } from 'express'
import adminService from './admin.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateEmployeeReqBody, UpdateAccountReqBody } from './admin.requests'
import { LoginRequestBody } from '../user/user.requests'
import Employee from '../employee/employee.schema'
import { ObjectId } from 'mongodb'
import { ADMIN_MESSAGES } from './admin.messages'
import { EmployeeRole } from './admin.enum'

export const loginController = async (
    req: Request<ParamsDictionary, any, LoginRequestBody>,
    res: Response,
    next: NextFunction
) => {
    const emp = req.emp as Employee
    const user_id = emp._id as ObjectId
    const role = emp.role as EmployeeRole
    const result = await adminService.login({
        user_id: user_id.toString(),
        role
    })

    const { refresh_token } = result
    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: Number(process.env.COOKIE_EXPIRE)
    })

    return res.json({
        message: ADMIN_MESSAGES.LOGIN_SUCCESS,
        data: result
    })
}

export const createEmpController = async (
    req: Request<ParamsDictionary, any, CreateEmployeeReqBody>,
    res: Response,
    next: NextFunction
) => {
    const result = await adminService.createEmp(req.body)
    return res.json({
        message: 'Create new employee successfully',
        result
    })
}

export const updateEmpController = async (
    req: Request<ParamsDictionary, any, UpdateAccountReqBody>,
    res: Response
) => {
    const { id } = req.params
    const result = await adminService.updateAccountById(id, req.body)

    return res.json({ message: 'UPDATE_ACCOUNT_SUCCESS', result })
}
