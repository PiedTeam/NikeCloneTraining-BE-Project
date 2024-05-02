import databaseService from '~/database/database.services'
import { StatusCodes } from 'http-status-codes'
import Otp from '../otp/otp.schema'
import { ErrorWithStatus } from '~/models/Error'
import { OTP_KIND, OTP_STATUS, OTP_TYPE } from './otp.enum'
import { OTP_MESSAGES } from './otp.messages'
import nodemailer from 'nodemailer'
import { encrypt } from '~/utils/crypto'

class OtpService {
    async sendOtpPhone(payload: { phone_number: string; otp: string }) {
        const user = await databaseService.users.findOne({
            phone_number: encrypt(payload.phone_number)
        })

        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
            })
        }

        // lưu otp vào db
        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: payload.otp,
                type: OTP_TYPE.PhoneNumber,
                status: OTP_STATUS.Available
            })
        )

        return result
    }

    async sendEmail(payload: { email: string; otp: string; kind: OTP_KIND }) {
        const { email, otp, kind } = payload

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        // const user = await usersService.checkEmailExist(email)
        const user = await databaseService.users.findOne({
            email: encrypt(email)
        })

        if (!user) {
            throw new ErrorWithStatus({
                message: OTP_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
            })
        }

        const result = await databaseService.OTP.insertOne(
            new Otp({
                user_id: user._id,
                OTP: otp,
                type: OTP_TYPE.Email,
                status: OTP_STATUS.Available
            })
        )

        await transporter.sendMail(
            {
                from: `${process.env.EMAIL_USER}`,
                to: `${email}`,
                subject:
                    kind === OTP_KIND.VerifyAccount
                        ? '[NIKE] OTP for Verify Account 🔑 🎉'
                        : '[NIKE] OTP for Password Recovery 🔑 🎉',
                html: `<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title></title>
                  <style>
                    span {
                      color: #333;
                    }
                    div {
                      color: #333;
                    }
                    .bg {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      color: #333;
                      margin: 20px 0px;
                      padding: 20px;
                      inherits: none;
                    }
                    .container {
                      max-width: fit-content;
                      margin: 20px auto;
                      padding: 20px;
                      background-color: #fff;
                      border-radius: 8px;
                      border-width: thin;
                      border-style: solid;
                      border-color: #dadce0;
                    }
                    .logo {
                      display: block;
                      margin: 0 auto;
                      width: 100px;
                    }
                    .otp {
                      display: block;
                      margin: 1.5rem auto;
                      width: fit-content;
                      padding: 15px 20px;
                      border-radius: 40px;
                      background-color: #333;
                      color: #fff;
                      font-size: 1.5rem;
                    }
                  </style>
                </head>
                <body>
                  <div class="bg">
                    <div class="container">
                      <img
                        src="https://res.cloudinary.com/dmubfrefi/image/private/s--8fW04AVq--/c_crop,h_2813,w_5000,x_0,y_0/c_scale,w_640/f_auto/q_auto/v1/dee-about-cms-prod-medias/cf68f541-fc92-4373-91cb-086ae0fe2f88/001-nike-logos-swoosh-black.jpg?_a=BAAAROBs"
                        class="logo"
                      />
                      <h1 style="text-align: center">${kind === OTP_KIND.VerifyAccount ? `Verify Account` : `Password Recovery`}</h1>
                      <p>Hi,</p>
                      <p>To proceed with the ${kind === OTP_KIND.VerifyAccount ? `account verify` : `password reset`}, please enter the otp.</p>
                      <h2 style="text-align: center; margin-top: 4rem">Dear ${user.username},</h2>
                      <p style="text-align: center; color: dimgray">
                        Your ${kind === OTP_KIND.VerifyAccount ? `account verify` : `password recovery`} OTP is
                      </p>
                      <p class="otp">code: ${otp}</p>
                      <p style="text-align: center; color: dimgray; margin-bottom: 4rem">
                        Please note that this OTP will only be valid for 10 minutes.
                      </p>
                      <p>
                        If you already received this code or don't need it anymore, ignore
                        this email.
                      </p>
              
                      <p>Thanks,<br />The Nike Team</p>
                    </div>
                  </div>
                </body>
              </html>`
            },
            (error) => {
                if (error) {
                    console.log(error)
                    throw new Error('Error sending email')
                }
            }
        )

        return result
    }
}

const otpService = new OtpService()
export default otpService
