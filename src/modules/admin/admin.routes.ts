import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import {
    createEmpController,
    loginController,
    updateEmpController
} from './admin.controllers'
import {
    accessTokenValidator,
    checkEmailOrPhone
} from '../user/user.middlewares'
import {
    checkRoleAdmin,
    createEmpValidator,
    loginValidator,
    updateAccValidator
} from './admin.middlewares'
import { filterMiddleware } from '~/utils/common.middlewares'
import { UpdateAccountReqBody } from './admin.requests'

const adminRouter = Router()

/*
  Description: Admin login 
  Path: admin/login
  Method: POST
  Body: {
    email_phone: string,
    password: string
  }
*/
adminRouter.post(
    '/login',
    // limiter,
    checkEmailOrPhone,
    loginValidator,
    wrapAsync(loginController)
)

/**
 ** Description: Create new employee
 * Method: POST
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: { 
 
 *  }
 */
adminRouter.post(
    '/createEmployee',
    accessTokenValidator,
    wrapAsync(checkRoleAdmin),
    checkEmailOrPhone,
    createEmpValidator,
    wrapAsync(createEmpController)
)

/**
 ** Description: Update account by id
 * Method: PATCH
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: { user_name?: string, role?: UserRole, date_of_birth?: string, phone_number?: string, email?: string }
 */
adminRouter.patch(
    '/:id',
    accessTokenValidator,
    wrapAsync(checkRoleAdmin),
    updateAccValidator,
    filterMiddleware<UpdateAccountReqBody>([
        'first_name',
        'last_name',
        'phone_number',
        'password',
        'role',
        'salary',
        'attendance_date',
        'contract_signed_date',
        'contract_expired_date'
    ]),
    wrapAsync(updateEmpController)
)

export default adminRouter
