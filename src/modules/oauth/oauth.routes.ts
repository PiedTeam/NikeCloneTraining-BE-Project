import passport, { Profile } from 'passport'
import { Router } from 'express'
import {
    loginFailController,
    loginSuccessController
} from './oauth.controllers'
import { wrapAsync } from '~/utils/handler'

export const oauthRouter = Router()

/*
  route: register or login by google
  path: user/google
  method: GET
  body: {
    username: string,
    password: string,
    email: string,
    phone_number: string,
    first_name: string,
    last_name: string
  }
*/
oauthRouter.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
)

/*
route: callback after login by google
path: user/google/callback
method: GET
body: {
  username: string,
  password: string,
  email: string,
  phone_number: string,
  first_name: string,
  last_name: string
}
*/
// oauthRouter.get(
//     '/google/callback',
//     passport.authenticate('google', {
//         failureRedirect: process.env.LOGIN_FAIL_URL,
//         successRedirect: process.env.LOGIN_SUCCESS_URL
//     })
// )
oauthRouter.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', (err: Error, profile: Profile) => {
            req.user = profile
            next()
        })(req, res, next)
    },
    (req, res) => {
        res.redirect(`${process.env.LOGIN_SUCCESS_URL}`)
    }
)

oauthRouter.post('/login-success', wrapAsync(loginSuccessController))

oauthRouter.post('/login-fail', wrapAsync(loginFailController))
