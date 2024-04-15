import express, { Response, Request } from 'express'
import cors from 'cors'
import databaseService from './database/database.services'
import usersRouter from './modules/user/user.routes'
import { config } from 'dotenv'
import { oauthRouter } from './modules/oauth/oauth.routes'
import '../passport.config'
config()

const app = express()
const port = 3000

app.use(express.json())
app.options('*', cors())
app.use(cors())

databaseService.connect()

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Developer')
})

app.use('/user', usersRouter)
app.use('/oauth', oauthRouter)

app.listen(port, () => {
    console.log(`Project Nike này đang chạy trên post ${port}`)
})
