import express, { Response, Request, NextFunction } from 'express'
import cors from 'cors'
import databaseService from './database/database.services'
import usersRouter from './modules/user/user.routes'
import { defaultErrorHandler } from './errors/errors.middlewares'

const app = express()
const port = 3000
app.use(express.json())
app.options('*', cors())
app.use(cors())

databaseService.connect()

app.use('/user', usersRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Developer')
})

// Create route to handle error for all routes in this app
app.use(defaultErrorHandler)

app.listen(port, () => {
    console.log(`Project Nike này đang chạy trên post ${port}`)
})
