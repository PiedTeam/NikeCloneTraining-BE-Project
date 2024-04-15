import { Strategy } from 'passport-google-oauth20'
import passport from 'passport'
import usersService from './src/modules/user/user.services'
import { RegisterReqBody } from '~/modules/user/user.requests'
import databaseService from '~/database/database.services'

const GoogleStrategy = Strategy

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID as string,
            clientSecret: process.env.CLIENT_SECRET as string,
            callbackURL: process.env.CLIENT_URL
        },
        async function (accessToken, refreshToken, profile, callback) {
            const { id, displayName, emails, name, photos } = profile
            const data: RegisterReqBody = {
                username: displayName,
                email: emails?.length ? emails[0].value : '',
                first_name: name?.familyName as string,
                last_name: name?.givenName as string,
                password: id,
                avatar_url: photos?.length ? photos[0].value : ''
            }
            console.log(data)

            const user = await usersService.checkEmailExist(
                data.email as string
            )
            if (!user) {
                await usersService.register(data)
            }

            return callback(null, profile)
        }
    )
)
