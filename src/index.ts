import express, { Response, Request } from 'express'
import cors from 'cors'
import databaseService from './database/database.services'

const app = express()
const port = 3000
app.use(express.json())
app.use(cors())

databaseService.connect()

app.get('/', cors(), (req: Request, res: Response) => {
    res.send('Hello Developer')
})

app.listen(port, () => {
    console.log(`Project Nike này đang chạy trên post ${port}`)
})
