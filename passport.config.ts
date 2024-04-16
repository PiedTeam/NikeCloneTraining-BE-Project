import { Strategy } from 'passport-google-oauth20'
import passport from 'passport'
import usersService from './src/modules/user/user.services'
import { RegisterReqBody } from '~/modules/user/user.requests'
import { encrypt } from '~/utils/crypto'

const GoogleStrategy = Strategy

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
            console.log(data)

            const isExist = await usersService.checkEmailExist(
                encrypt(data.email) as string
            )
            if (!isExist) {
                await usersService.register(data, profile.provider as string)
            }

            return callback(null, profile)
        }
    )
)
