import express, { Response, Request, NextFunction } from 'express'
import cors from 'cors'
import databaseService from './database/database.services'
import usersRouter from './modules/user/user.routes'
import { oauthRouter } from './modules/oauth/oauth.routes'
import { defaultErrorHandler } from './errors/errors.middlewares'
import { config } from 'dotenv'
import '../passport.config'
config()

const app = express()
const port = 3000

app.use(express.json())

const corsOptions = {
    origin: '*',
    credentials: true, // access-control-allow-credentials:true
    allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
    optionSuccessStatus: 200
}
app.use(cors(corsOptions))

databaseService.connect()

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Developer')
})

app.use('/user', usersRouter)
app.use('/oauth', oauthRouter)

// Create route to handle error for all routes in this app
app.use(defaultErrorHandler)

app.listen(port, () => {
    console.log(`Project Nike này đang chạy trên post ${port}`)
})
