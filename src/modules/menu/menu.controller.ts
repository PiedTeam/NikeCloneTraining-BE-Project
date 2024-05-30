import { Request, Response } from 'express'
import menuService from './menu.service'

export const getMenuController = async (req: Request, res: Response) => {
    const { language } = req.params
    const result = await menuService.getMenu(language)
    res.json(result)
}
