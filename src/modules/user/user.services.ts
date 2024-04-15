import databaseService from '~/database/database.services'
import User from './user.schema'
import { ObjectId } from 'mongodb'
import { RegisterReqBody } from './user.requests'

class UsersService {
    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }

    async checkUsernameExist(username: string) {
        const user = await databaseService.users.findOne({ username })
        return Boolean(user)
    }

    async register(payload: RegisterReqBody) {
        const user_id = new ObjectId()
        const result = await databaseService.users.insertOne(
            new User({
                ...payload,
                _id: user_id,
                email: payload.email as string,
                phone_number:
                    payload.phone_number === undefined
                        ? ''
                        : payload.phone_number,
                password: payload.password
            })
        )

        return result
    }
}

const usersService = new UsersService()
export default usersService
