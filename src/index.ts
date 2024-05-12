import express, { Response, Request } from 'express'
import cors from 'cors'
import databaseService from './database/database.services'
import usersRouter from './modules/user/user.routes'
import { oauthRouter } from './modules/oauth/oauth.routes'
import { defaultErrorHandler } from './errors/errors.middlewares'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import '../passport.config'
import otpRouter from './modules/otp/otp.routes'
import passwordRouter from './modules/password/pass.routes'
import { blockPostman } from './modules/user/user.middlewares'

const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())
app.use(cookieParser())

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

app.use('/pass', blockPostman, passwordRouter)
app.use('/user', blockPostman, usersRouter)
app.use('/oauth', oauthRouter)
app.use('/otp', blockPostman, otpRouter)
// Create route to handle error for all routes in this app
app.use(defaultErrorHandler)

app.listen(PORT, () => {
    console.log(`Project Nike is running on http://localhost:${PORT}/`)
})
