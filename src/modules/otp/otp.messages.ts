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
    ACCOUNT_IS_BANNED: 'Account is banned',
    // OTP Validation Messages
    OTP_iS_USED: 'OTP has been already used or has been expired',
    OTP_IS_INCORRECT: 'OTP is incorrect',
    OTP_NOT_FOUND: 'OTP is not found',

    // OTP Success | Fail Messages
    SEND_OTP_SUCCESSFULLY: 'Send OTP successfully!',
    VERIFY_OTP_SUCCESSFULLY: 'Verify OTP successfully',
    RESET_PASSWORD_SUCCESSFULLY: 'Reset password successfully',

    // OTP Expired Messages
    OTP_IS_EXPIRED: 'OTP is expired',

    // Other Messages
    REQUIRE_FIELD_IS_INVALID: 'Require field is invalid'
} as const
