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
const PORT_SERVER = process.env.PORT ?? 4000

export const isProduction = process.env.NODE_ENV == 'production'
const frontendURL = isProduction ? process.env.PRODUCTION_FRONTEND_URL : process.env.DEVELOPMENT_FRONTEND_URL

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
    origin: frontendURL,
    credentials: true, // access-control-allow-credentials:true
    allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
    optionSuccessStatus: 200
}

// Middlewares setup
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// Log all requests incoming
// app.all('*', (req, res, next) => {
//     console.log('Time', Date.now())
//     console.log(req)
//     next()
// })

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
;(async () => {
    await databaseService.connect()
    app.listen(PORT_SERVER, () => {
        console.log(`Server is running in ${isProduction ? 'production' : 'development'} mode`)
        console.log(`Nike Server is running on http://localhost:${PORT_SERVER}`)
    })
})()
