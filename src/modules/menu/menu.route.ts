import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { getMenuController } from './menu.controller'

const menuRouter = Router()

menuRouter.get('/', wrapAsync(getMenuController))

export default menuRouter
