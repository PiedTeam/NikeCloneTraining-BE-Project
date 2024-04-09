import { ObjectId } from 'mongodb'
import { OtpsStatus, OtpsType } from './opt.enum'

interface OtpType {
    _id?: ObjectId
    user_id: ObjectId
    otp: string
    type: OtpsType
    created_at?: Date
    status: OtpsStatus
}

class Otp {
    _id?: ObjectId
    user_id: ObjectId
    otp: string
    type: OtpsType
    created_at: Date
    status: OtpsStatus
    constructor({ _id, user_id, otp, type, created_at, status }: OtpType) {
        this._id = _id
        this.user_id = user_id
        this.otp = otp
        this.type = type
        this.created_at = created_at || new Date()
        this.status = status
    }
}

export default Otp
