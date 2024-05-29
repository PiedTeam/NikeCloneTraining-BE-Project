import { Request, Response } from 'express'
import menuService from './menu.service'

export const getMenuController = async (req: Request, res: Response) => {
    const result = await menuService.getMenu()
    res.json(result)
}
