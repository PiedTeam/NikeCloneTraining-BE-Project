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
  path: oauth/google
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
path: oauth/google/callback
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
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', (err: Error, profile: Profile) => {
            req.body = profile
            next()
        })(req, res, next)
    },
    (req, res) => {
        const { access_token, refresh_token, new_user, iat, exp } = req.body
        // res.redirect(
        //     `${process.env.LOGIN_SUCCESS_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}&iat=${iat}&exp=${exp}`
        // )
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: true,
            maxAge: Number(process.env.COOKIE_EXPIRE)
        })

        res.redirect(
            `${process.env.FE_REDIRECT_URL}/?access_token=${access_token}&new_user=${new_user}&iat=${iat}&exp=${exp}`
        )
    }
)

/*
  route: register or login by Facebook
  path: oauth/facebook
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
    '/facebook',
    passport.authenticate('facebook', {
        session: false,
        scope: ['email']
    })
)

/*
route: callback after login by Facebook
path: oauth/facebook/callback
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
    '/facebook/callback',
    (req, res, next) => {
        passport.authenticate('facebook', (err: Error, profile: Profile) => {
            req.body = profile
            next()
        })(req, res, next)
    },
    (req, res) => {
        const { access_token, refresh_token, new_user, iat, exp } = req.body
        // res.redirect(
        //     `${process.env.LOGIN_SUCCESS_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}&iat=${iat}&exp=${exp}`
        // )
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: true,
            maxAge: Number(process.env.COOKIE_EXPIRE)
        })
        res.redirect(
            `${process.env.FE_REDIRECT_URL}/?access_token=${access_token}&new_user=${new_user}&iat=${iat}&exp=${exp}`
        )
    }
)



// oauthRouter.get('/login-success', wrapAsync(loginSuccessController))
// oauthRouter.get('/login-fail', wrapAsync(loginFailController))
