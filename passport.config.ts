import { Strategy as Google_Strategy } from 'passport-google-oauth20'
import { Strategy as Facebook_Strategy } from 'passport-facebook'
import passport from 'passport'
import usersService from './src/modules/user/user.services'
import { RegisterOauthReqBody } from '~/modules/user/user.requests'
import { encrypt } from '~/utils/crypto'
import databaseService from '~/database/database.services'
import 'dotenv/config'

const GoogleStrategy = Google_Strategy
const FacebookStrategy = Facebook_Strategy
const isProduction2 = process.env.NODE_ENV == 'production'
console.log('isProduction2', isProduction2)
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID as string,
            clientSecret: process.env.CLIENT_SECRET as string,
            callbackURL: isProduction2 ? process.env.PRODUCTION_CLIENT_URL : process.env.DEVELOPMENT_CLIENT_URL,
            scope: ['profile', 'email']
        },
        async function (accessToken, refreshToken, profile, callback) {
            const { id, displayName, emails, name, photos, provider } = profile
            const data: RegisterOauthReqBody = {
                // username: displayName,
                email: emails?.length ? emails[0].value : '',
                first_name: name?.familyName as string,
                last_name: name?.givenName as string,
                password: id,
                avatar_url: photos?.length ? photos[0].value : '',
                subscription: 1
            }

            const isExist = await usersService.checkEmailExist(encrypt(data.email) as string)

            const result: {
                new_user: boolean
                access_token?: string
                refresh_token?: string
                iat?: Date
                exp?: Date
            } = {
                new_user: !isExist
            }

            if (!isExist) {
                const { access_token, refresh_token } = await usersService.register(data, provider as string)

                result.access_token = access_token
                result.refresh_token = refresh_token
            } else {
                const user = await databaseService.users.findOne({
                    email: encrypt(data.email)
                })
                const { access_token, refresh_token } = await usersService.login({
                    user_id: user?._id.toString() as string,
                    status: user?.status as number
                })

                result.access_token = access_token
                result.refresh_token = refresh_token
            }
            const user = await databaseService.users.findOne({
                email: encrypt(data.email)
            })

            const user_refesh_token = await databaseService.refreshTokens.findOne({
                user_id: user?._id
            })
            result.iat = user_refesh_token?.iat
            result.exp = user_refesh_token?.exp

            return callback(null, result)
        }
    )
)

export const configLoginWithFacebook = () => {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID as string,
                clientSecret: process.env.FACEBOOK_APP_SECRET as string,
                callbackURL: process.env.FACEBOOK_APP_CALLBACK_URL as string,
                profileFields: ['email', 'photos', 'id', 'displayName']
            },
            async function (accessToken, refreshToken, profile, callback) {
                const SECRET_PASS = process.env.FB_SECRET_PASSWORD as string
                const { id, displayName, emails, photos, provider } = profile
                console.log('🚀 ~ profile:', profile)

                const data: RegisterOauthReqBody = {
                    email: emails?.length ? emails[0].value : id,
                    first_name: displayName.split(' ')[0],
                    last_name: displayName.split(' ').slice(1).join(' '),
                    password: id + SECRET_PASS,
                    avatar_url: photos?.length ? photos[0].value : '',
                    subscription: 1
                }

                const isExist = await usersService.checkEmailExist(encrypt(data.email) as string)

                const result: {
                    new_user: boolean
                    access_token?: string
                    refresh_token?: string
                    iat?: Date
                    exp?: Date
                } = { new_user: !isExist }

                if (!isExist) {
                    const { access_token, refresh_token } = await usersService.register(data, provider)

                    result.access_token = access_token
                    result.refresh_token = refresh_token
                } else {
                    const user = await databaseService.users.findOne({
                        email: encrypt(data.email)
                    })

                    const { access_token, refresh_token } = await usersService.login({
                        user_id: user?._id.toString() as string,
                        status: user?.status as number
                    })

                    result.access_token = access_token
                    result.refresh_token = refresh_token
                }

                const user = await databaseService.users.findOne({
                    email: encrypt(data.email)
                })

                const user_refresh_token = await databaseService.refreshTokens.findOne({
                    user_id: user?._id
                })

                result.iat = user_refresh_token?.iat
                result.exp = user_refresh_token?.exp

                return callback(null, result)
            }
        )
    )
}
