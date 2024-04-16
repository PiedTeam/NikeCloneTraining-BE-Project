import databaseService from '~/database/database.services'

export const loginSuccessService = async (email: string) => {
    const user = databaseService.users.findOne({ email })
    return user
}
