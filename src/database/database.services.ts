import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/modules/user/user.schema'
import Otp from '~/modules/otp/otp.schema'
import RefreshToken from '~/modules/refreshToken/refreshToken.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@piednike.tq8fhlk.mongodb.net/?retryWrites=true&w=majority&appName=PiedNike`

class DatabaseService {
    private client: MongoClient
    private db: Db
    constructor() {
        this.client = new MongoClient(uri)
        this.db = this.client.db(process.env.DB_NAME)
    }

    async connect() {
        try {
            await this.client.connect()
            console.log(
                'Pinged your deployment. You successfully connected to MongoDB!'
            )
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    get users(): Collection<User> {
        return this.db.collection(process.env.DB_USERS_COLLECTION as string)
    }

    get otps(): Collection<Otp> {
        return this.db.collection(process.env.DB_OTPS_COLLECTION as string)
    }

    get refreshTokens(): Collection<RefreshToken> {
        return this.db.collection(
            process.env.DB_REFRESH_TOKENS_COLLECTION as string
        )
    }
}

const databaseService = new DatabaseService()
export default databaseService
