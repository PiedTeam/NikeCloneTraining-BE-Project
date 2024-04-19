import { Strategy as Google_Strategy } from 'passport-google-oauth20'
import { Strategy as Facebook_Strategy } from 'passport-facebook'
import passport from 'passport'
import usersService from './src/modules/user/user.services'
import { RegisterReqBody } from '~/modules/user/user.requests'
import { encrypt } from '~/utils/crypto'

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
            const data: RegisterReqBody = {
                username: displayName,
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
            if (!isExist) {
                await usersService.register(data, provider as string)
            }

            return callback(null, profile)
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
            const data: RegisterReqBody = {
                username: displayName,
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
            if (!isExist) {
                await usersService.register(data, provider as string)
            }

            return callback(null, profile)
        }
    )
)
