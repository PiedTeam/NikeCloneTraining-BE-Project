import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { getMenuController } from './menu.controller'

const menuRouter = Router()

menuRouter.get('/:language', wrapAsync(getMenuController))

export default menuRouter
