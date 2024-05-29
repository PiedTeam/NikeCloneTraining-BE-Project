import express, { Response, Request } from 'express'
import cors from 'cors'
import databaseService from './database/database.services'
import usersRouter from './modules/user/user.routes'
import { oauthRouter } from './modules/oauth/oauth.routes'
import { defaultErrorHandler } from './errors/errors.middlewares'
import cookieParser from 'cookie-parser'
import '../passport.config'
import otpRouter from './modules/otp/otp.routes'
import passwordRouter from './modules/password/pass.routes'
import 'dotenv/config'
import menuRouter from './modules/menu/menu.route'

const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())
app.use(cookieParser())

const whitelist = [
    'http://localhost:3000',
    'https://nikeclonetraining-be-project.onrender.com/'
]
// const corsOptions = {
//     origin: function (origin: any, callback: any) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     },
//     credentials: true, // access-control-allow-credentials:true
//     allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
//     optionSuccessStatus: 200
// }

// THIS IS FOR TESTING ONLY
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

app.use('/pass', passwordRouter)
app.use('/user', usersRouter)
app.use('/oauth', oauthRouter)
app.use('/otp', otpRouter)
app.use('/menu', menuRouter)
// Create route to handle error for all routes in this app
app.use(defaultErrorHandler)

app.listen(PORT, () => {
    console.log(`Project Nike is running on http://localhost:${PORT}/`)
})
