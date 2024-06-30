import { Router } from "express";
// import { limiter } from '~/config/limitRequest'
import { cronJobFake } from "~/utils/cronJobFake";
import { wrapAsync } from "~/utils/handler";
import {
    blockAccountController,
    changePasswordController,
    forgotPasswordController,
    getListUserController,
    getMeController,
    loginController,
    logoutController,
    refreshTokenController,
    registerController,
    resetPasswordController,
    searchAccountController,
    sendVerifyAccountOTPController,
    unblockAccountController,
    updateMeController,
    verifyAccountController,
    verifyForgotPasswordTokenController,
} from "./user.controllers";
import {
    accessTokenValidator,
    changePasswordValidator,
    checkEmailOrPhone,
    checkNewPasswordValidator,
    checkVerifyAccount,
    forgotPasswordValidator,
    isUserRole,
    loginValidator,
    pagination,
    refreshTokenCookieValidator,
    registerValidator,
    resetPasswordValidator,
    searchAccountValidator,
    updateMeValidator,
    verifiedUserValidator,
    verifyAccountValidator,
    verifyOTPValidator,
} from "./user.middlewares";
import { UserRole } from "./user.enum";

const usersRouter = Router();

/*
  Description: register by username
  Path: user/register
  Method: POST
  Body: {
    username: string,
    password: string,
    email: string,
    phone_number: string,
    first_name: string,
    last_name: string
  }
*/
usersRouter.post(
    "/register",
    wrapAsync(cronJobFake),
    checkEmailOrPhone,
    registerValidator,
    wrapAsync(registerController),
);

/*
  Description: User login 
  Path: user/login
  Method: POST
  Body: {
    email_phone: string,
    password: string
  }
*/
usersRouter.post(
    "/login",
    // limiter,
    checkEmailOrPhone,
    loginValidator,
    wrapAsync(loginController),
);

/*
  Description: send otp forgot password to user's email or phone number
  Path: /user/forgot-password
  Method: 'POST'
  Body: { email_phone: string }
*/
usersRouter.post(
    "/forgot-password",
    // limiter,
    checkEmailOrPhone,
    forgotPasswordValidator,
    wrapAsync(forgotPasswordController),
);

/*
  Description: verify otp
  Path: /users/verify-password
  Method: 'POST'
  Body: {
    email_phone: string,
    forgot_password_otp: string
  }
*/
usersRouter.post(
    "/verify-otp",
    checkEmailOrPhone,
    verifyOTPValidator,
    wrapAsync(verifyForgotPasswordTokenController),
);

/*
des: reset password
path: '/reset-password'
method: POST
body: {
        email_phone: string,
        forgot_password_otp: string,
        password: string,
        confirm_password: string
      }
*/
usersRouter.post(
    "/reset-password",
    resetPasswordValidator,
    checkEmailOrPhone,
    verifyOTPValidator,
    checkNewPasswordValidator,
    wrapAsync(resetPasswordController),
);

/*
  Description: Send OTP verify account to user's email or phone number
  Path: /users/verify-account
  Method: POST
  Header: { Authorization: Bearer <access_token> }
  Body: { email_phone: string }
*/
usersRouter.post(
    "/send-verify-account-otp",
    accessTokenValidator,
    checkEmailOrPhone,
    verifyAccountValidator,
    wrapAsync(sendVerifyAccountOTPController),
);

/*
   * Description: Verify account
  Path: /users/verify-account
  Method: POST
  Header: { Authorization: Bearer <access_token> }
  Body: { email_phone: string, verify_account_otp: string }
*/
usersRouter.post(
    "/verify-account",
    accessTokenValidator,
    checkVerifyAccount,
    checkEmailOrPhone,
    verifyAccountValidator,
    verifyOTPValidator,
    wrapAsync(verifyAccountController),
);

/*
  Description: change password
  Path: '/change-password'
  Method: POST
  Header: { Authorization: Bearer <access_token> }
  Body: { old_password: string, new_password: string }
*/
usersRouter.post(
    "/change-password",
    accessTokenValidator,
    changePasswordValidator,
    wrapAsync(changePasswordController),
);

/*
  Description: get user's profile
  Path: '/me'
  Method: get
  Header: { Authorization: Bearer <access_token> }
  Body: {}
*/
usersRouter.get("/me", accessTokenValidator, wrapAsync(getMeController));

/*
  Description: update user's profile
  Path: '/me'
  Method: patch
  Header: { Authorization: Bearer <access_token> }
  Body: { first_name: string, last_name: string, email: string, phone_number: string, ...}
*/
usersRouter.patch(
    "/me",
    accessTokenValidator,
    verifiedUserValidator,
    updateMeValidator,
    wrapAsync(updateMeController),
);

/*
  Description: search API account
  Path: /users/search
  Method: GET
  Header: { Authorization: Bearer <access_token> }
  Body: { email_phone: string }
*/
// usersRouter.post(
//     '/search',
//     accessTokenValidator,
//     checkEmailOrPhone,
//     searchAccountValidator,
//     wrapAsync(searchAccountController)
// )

usersRouter.post(
    "/search",
    accessTokenValidator,
    checkEmailOrPhone,
    searchAccountValidator,
    wrapAsync(searchAccountController),
);

usersRouter.post(
    "/logout",
    accessTokenValidator,
    refreshTokenCookieValidator,
    wrapAsync(logoutController),
);

usersRouter.post(
    "/refresh-token",
    refreshTokenCookieValidator,
    wrapAsync(refreshTokenController)
)

usersRouter.post(
    '/block',
    accessTokenValidator,
    refreshTokenCookieValidator,
    wrapAsync(blockAccountController)
)

usersRouter.post('/unblock', wrapAsync(unblockAccountController))

usersRouter.get(
    "/list-account",
    // accessTokenValidator,
    // wrapAsync(isUserRole([UserRole.Admin])),
    wrapAsync(pagination),
    wrapAsync(getListUserController),
);

export default usersRouter;
