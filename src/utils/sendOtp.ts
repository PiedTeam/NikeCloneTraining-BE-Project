import twilio from 'twilio'
import nodemailer from 'nodemailer'
import path from 'path'
import hbs from 'nodemailer-express-handlebars'
// import fs from 'fs'
// import Handlebars from 'handlebars'
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

export const sendOtpMail = async (payload: {
    kind: OTP_KIND
    otp: string
    email: string
    username: string
}) => {
    const { kind, otp, email, username } = payload

    // const emailTemplateSource = fs.readFileSync(
    //     'E:\\Studies\\nike_project\\sendOTP\\real\\NikeCloneTraining-BE-Project\\src\\public\\template\\gmailTemplateOtp.handlebars',
    //     'utf8'
    // )

    // const template = Handlebars.compile(emailTemplateSource)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER as string,
            pass: process.env.EMAIL_PASSWORD as string
        }
    })

    const handlebarOptions = {
        viewEngine: {
            extName: '.hbs',
            partialsDir: path.join(__dirname, '../public/template'),
            layoutsDir: path.join(__dirname, '../public/template'),
            defaultLayout: ''
        },
        viewPath: path.join(__dirname, '../public/template'),
        extName: '.hbs'
    }

    transporter.use('compile', hbs(handlebarOptions))

    const name =
        kind === OTP_KIND.VerifyAccount ? 'account verify' : 'password recovery'

    const mailOptions = {
        from: `${process.env.EMAIL_USER}`,
        to: email,
        subject: `[NIKE] OTP for ${name} 🔑 🎉`,
        // html: template({ name, otp, username: username })
        template: 'gmailTemplateOtp',
        context: {
            name,
            otp,
            username
        }
    }

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error)
            throw new Error('Error sending email')
        }
    })
}
