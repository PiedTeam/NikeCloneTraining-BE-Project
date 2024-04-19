import express, { Response, Request } from 'express'
import cors from 'cors'
import databaseService from './database/database.services'
import usersRouter from './modules/user/user.routes'
import otpRouter from './modules/otp/otp.routes'

const app = express()
const PORT = process.env.PORT || 3000
app.use(express.json())
app.options('*', cors())
app.use(cors())

databaseService.connect()

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Developer')
})

app.use('/user', usersRouter)

app.use('/otp', otpRouter)

app.listen(PORT, () => {
    console.log(`Project Nike is running on http://localhost:${PORT}/`)
})
