import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/modules/user/user.requests'

export const signToken = ({
    payload,
    privateKey,
    options = { algorithm: 'HS256' }
}: {
    payload: string | object | Buffer
    privateKey: string
    options?: jwt.SignOptions
}) => {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, privateKey, options, (err, token) => {
            if (err) throw reject(err)
            resolve(token as string)
        })
    })
}

export const verifyToken = ({ token, secretOrPublickey }: { token: string; secretOrPublickey: string }) => {
    return new Promise<TokenPayload>((resolve, reject) => {
        jwt.verify(token, secretOrPublickey, (error, decoded) => {
            if (error) return reject(error)
            resolve(decoded as TokenPayload)
        })
    })
}
