import { ObjectId } from 'mongodb'
import { OTP_STATUS, OTP_TYPE } from './otp.enum'

interface OtpType {
    _id?: ObjectId
    user_id: ObjectId
    OTP: string
    type: OTP_TYPE
    incorrTimes?: number
    status: OTP_STATUS
    created_at?: Date
    expired_at?: Date
}

class Otp {
    _id?: ObjectId
    user_id: ObjectId
    OTP: string
    type: OTP_TYPE
    incorrTimes: number
    status: OTP_STATUS
    created_at?: Date
    expired_at?: Date
    constructor({
        _id,
        user_id,
        OTP,
        type,
        created_at,
        incorrTimes = 0,
        status,
        expired_at
    }: OtpType) {
        this._id = _id
        this.user_id = user_id
        this.OTP = OTP
        this.type = type
        this.incorrTimes = incorrTimes
        this.status = status
        this.created_at = created_at || new Date()
        this.expired_at =
            expired_at || OTP_TYPE.PhoneNumber
                ? new Date(new Date().getTime() + 5 * 60000)
                : new Date(new Date().getTime() + 10 * 60000)
    }
}

export default Otp
