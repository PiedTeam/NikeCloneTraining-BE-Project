import twilio from 'twilio'
import { OTP_KIND } from '~/modules/otp/otp.enum'

export const sendOtpPhone = async (payload: {
    kind: OTP_KIND
    otp: string
    phone_number: string
    username: string
}) => {
    const { kind, otp, phone_number, username } = payload

    const name =
        kind === OTP_KIND.VerifyAccount ? 'account verify' : 'password recovery'

    const accountSid = process.env.TWILIO_ACCOUNT_SID as string
    const authToken = process.env.TWILIO_AUTH_TOKEN as string

    const client = twilio(accountSid, authToken)

    try {
        const message = client.messages
            .create({
                body: `Dear ${username}, your OTP for ${name} is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER as string,
                to: `+84${phone_number.slice(1)}`
            })
            .then((message) => console.log(message.sid))
    } catch (error) {
        console.log(error)
        throw new Error('Error sending SMS')
    }
}
