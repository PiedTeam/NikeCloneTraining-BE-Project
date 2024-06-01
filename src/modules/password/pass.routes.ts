import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { registerPassword } from './pass.controllers'
import { registerPasswordValidator } from './pass.middleware'
import { blockPostman } from '../user/user.middlewares'

const passwordRouter = Router()
passwordRouter.post('/updatePass', registerPasswordValidator, wrapAsync(registerPassword))

export default passwordRouter
