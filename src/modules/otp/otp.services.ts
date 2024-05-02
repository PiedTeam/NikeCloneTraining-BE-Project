import databaseService from '~/database/database.services'
import { StatusCodes } from 'http-status-codes'
import Otp from '../otp/otp.schema'
import { ErrorWithStatus } from '~/models/Error'
import { OTP_STATUS, OTP_TYPE } from './otp.enum'
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

    async sendEmail({ email, otp }: { email: string; otp: string }) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        // const user = await usersService.checkEmailExist(email)
        const user = await databaseService.users.findOne({ email })
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
                subject: '[NIKE] Please Verify Your Email By OTP 🔑 🎉',
                html: `<!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Flipping Card UI Design</title>
                    <style>
                      /* Import Google Font - Poppins */
                      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                
                      * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Poppins', sans-serif;
                      }
                      section {
                        position: relative;
                        min-height: 30vh;
                        width: 65%;
                        height: 100%;
                        background: #121321;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #fff;
                        perspective: 1000px;
                        margin-top: 80px; /* moi them */
                      }
                      .container-1 {
                        position: relative;
                        max-height: 100%;
                        left: 0px;
                        width: 50%;
                        /* height: 30%; */
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-top: 20px; /* moi them */
                        /* margin-left: 150px; */
                      }
                      .container {
                        position: relative;
                        height: 225px;
                        width: 375px;
                        z-index: 100;
                        transition: 0.6s;
                        transform-style: preserve-3d;
                        margin-top: 15px; /* moi them */
                        margin-left: 55px;
                
                      }
                      .container .card {
                        position: absolute;
                        height: 100%;
                        width: 100%;
                        padding: 25px;
                        border-radius: 25px;
                        backdrop-filter: blur(25px);
                        background: rgba(255, 255, 255, 0.1);
                        box-shadow: 0 25px 45px rgba(0, 0, 0, 0.25);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        backface-visibility: hidden;
                      }
                      .front-face header,
                      .front-face .logo {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 30px;
                      }
                      .front-face header {
                        justify-content: space-between;
                      }
                      .front-face .logo img {
                        width: 48px;
                        margin-right: 10px;
                        border-radius: 15px;
                      }
                      h5 {
                        font-size: 16px;
                        font-weight: 400;
                        margin-top: 15px;
                        margin-left: 20px;
                      }
                      .front-face .pied-logo {
                        width: 50px;
                        border-radius: 10px;
                      }
                      .front-face .card-details {
                        display: flex;
                        margin-top: 40px;
                        margin-left: 85px;
                        align-items: flex-end;
                        justify-content: space-between;
                      }
                      h6 {
                        font-size: 10px;
                        font-weight: 400;
                      }
                      h5.number {
                        font-size: 18px;
                        letter-spacing: 1px;
                      }
                      h5.name {
                        margin-top: 20px;
                      }
                      .X-sticker {
                        margin-top: 17px;
                        margin-right: 7.5px;
                      }
                      .footer {
                        display: flex;
                        justify-content: space-around;
                        margin-top: 20px;
                        margin-left: 85px;
                      }
                      .valid-date h6 {
                        font-size: 12px;
                        font-weight: 400;
                      }
                    </style>
                  </head>
                  <body>
                    <p style="color: black">Hi there,<br>
                      We requires a verified email address so you can take full advantage of [NIKE]'s website features - and so you can safely recover your account in the future.
                    </p>
                    <div class="container-1">
                      <br>
                      <section>
                        <div class="container">
                          <div class="card front-face">
                            <header>
                              <div class="logo">
                                <img src="https://i.pinimg.com/736x/33/e6/3d/33e63d5adb0da6b303a83901c8e8463a.jpg" alt="nike logo" />
                                <span class="X-sticker"> X </span>
                                <img src="https://scontent.fhan4-6.fna.fbcdn.net/v/t39.30808-6/403698685_889491689431488_5341465690336676462_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=5f2048&_nc_ohc=RRdTGh1R7wwQ7kNvgH-2WNl&_nc_ht=scontent.fhan4-6.fna&oh=00_AfDXuM0PwFp27uOLf-ekdjk4fE2V1TOz1rBS8UylNBAyIw&oe=6638F45E" alt="" class="pied-logo" />
                              </div>
                              <h5>MASTER OTP CARD</h5>
                            </header>
                  
                            <div class="card-details">
                              <div class="name-number">
                                <h2>OTP Code: ${otp}</h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
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
