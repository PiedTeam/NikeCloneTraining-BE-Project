import { Strategy as Google_Strategy } from 'passport-google-oauth20'
import { Strategy as Facebook_Strategy } from 'passport-facebook'
import passport from 'passport'
import usersService from './src/modules/user/user.services'
import {
    RegisterOauthReqBody,
    RegisterReqBody
} from '~/modules/user/user.requests'
import { encrypt } from '~/utils/crypto'
import databaseService from '~/database/database.services'
import { limiter } from '~/config/limitRequest'
import User from '~/modules/user/user.schema'
import { UserRole, UserVerifyStatus } from '~/modules/user/user.enum'
import { ObjectId } from 'mongodb'

const GoogleStrategy = Google_Strategy
const FacebookStrategy = Facebook_Strategy

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID as string,
            clientSecret: process.env.CLIENT_SECRET as string,
            callbackURL: process.env.CLIENT_URL
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

            const isExist = await usersService.checkEmailExist(
                encrypt(data.email) as string
            )

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
                const { access_token, refresh_token } =
                    await usersService.register(data, provider as string)

                result.access_token = access_token
                result.refresh_token = refresh_token
            } else {
                const user = await databaseService.users.findOne({
                    email: encrypt(data.email)
                })
                const { access_token, refresh_token } =
                    await usersService.login({
                        user_id: user?._id.toString() as string,
                        status: user?.status as UserVerifyStatus,
                        role: user?.role as UserRole
                    })

                result.access_token = access_token
                result.refresh_token = refresh_token
            }
            const user = await databaseService.users.findOne({
                email: encrypt(data.email)
            })

            const user_refesh_token =
                await databaseService.refreshTokens.findOne({
                    user_id: user?._id
                })
            result.iat = user_refesh_token?.iat
            result.exp = user_refesh_token?.exp

            return callback(null, result)
        }
    )
)

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID as string,
            clientSecret: process.env.FACEBOOK_APP_SECRET as string,
            callbackURL: process.env.FACEBOOK_APP_CALLBACK_URL as string,
            profileFields: ['email', 'photos', 'id', 'displayName']
        },
        async function (accessToken, refreshToken, profile, callback) {
            const { id, displayName, emails, name, photos, provider } = profile
            const data: RegisterOauthReqBody = {
                // username: displayName,

                email: emails?.length ? emails[0].value : '',
                first_name: displayName.split(' ')[0],
                last_name: displayName.split(' ').slice(1).join(' '),
                password: id,
                avatar_url: photos?.length ? photos[0].value : '',
                subscription: 1
            }

            const isExist = await usersService.checkEmailExist(
                encrypt(data.email) as string
            )

            // console.log(isExist)

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
                const { access_token, refresh_token } =
                    await usersService.register(data, provider as string)

                result.access_token = access_token
                result.refresh_token = refresh_token
            } else {
                const user = await databaseService.users.findOne({
                    email: encrypt(data.email)
                })

                const { access_token, refresh_token } =
                    await usersService.login({
                        user_id: user?._id.toString() as string,
                        status: user?.status as UserVerifyStatus,
                        role: user?.role as UserRole
                    })

                result.access_token = access_token
                result.refresh_token = refresh_token
            }

            const user = await databaseService.users.findOne({
                email: encrypt(data.email)
            })

            const user_refesh_token =
                await databaseService.refreshTokens.findOne({
                    user_id: user?._id
                })

            result.iat = user_refesh_token?.iat
            result.exp = user_refesh_token?.exp

            return callback(null, result)
        }
    )
)
