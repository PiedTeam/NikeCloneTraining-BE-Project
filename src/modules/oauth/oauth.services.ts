import databaseService from '~/database/database.services'

export const loginSuccessService = async (email: string) => {
    const user = databaseService.refreshTokens.findOne({ email })
    console.log(user)
}
