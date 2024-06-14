export const OTP_MESSAGES = {
    VALIDATION_ERROR: 'Validation error!',

    // OTP
    SEND_OTP_PHONE_SUCCESS: 'Send OTP via phone number successfully',
    SEND_OTP_MAIL_SUCCESS: 'Send OTP via mail successfully',
    SEND_OTP_OVER_LIMIT_TIME:
        'Send otp over 6 times, Please wait 24 hours to try again',
    PHONE_NUMBER_WAS_VERIFIED: 'Phone number was verified',
    EMAIL_WAS_VERIFIED: 'Email was verified',

    // USER
    USER_NOT_FOUND: 'User not found!',
    OTP_IS_REQUIRED: 'OTP is required',
    OTP_IS_NUMBER: 'OTP must be a number',
    OTP_LENGTH_IS_6: 'OTP must be 6 characters',
    VERIFY_OTP_SUCCESS: 'Verify OTP successfully',
    CAN_NOT_SEND_OTP_BY: 'Can not send OTP by',
    ACCOUNT_IS_BANNED: 'Account is banned'
} as const
