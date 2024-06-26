export const OTP_MESSAGES = {
    // OTP Validation Messages
    OTP_IS_REQUIRED: "OTP is required",
    OTP_IS_NUMBER: "OTP must be a number",
    OTP_LENGTH_IS_6: "OTP must be 6 characters",
    OTP_iS_USED: "OTP has been already used or has been expired",
    OTP_IS_INCORRECT: "OTP is incorrect",
    OTP_NOT_FOUND: "OTP is not found",

    // OTP Success | Fail Messages
    SEND_OTP_SUCCESSFULLY: "Send OTP successfully!",
    VERIFY_OTP_SUCCESSFULLY: "Verify OTP successfully",
    RESET_PASSWORD_SUCCESSFULLY: "Reset password successfully",

    // OTP Count Limit Messages
    SEND_OTP_OVER_LIMIT_TIME:
        "Send otp over 3 time, Please wait 24 hours to try again",

    // OTP Expired Messages
    OTP_IS_EXPIRED: "OTP is expired",

    // Other Messages
    REQUIRE_FIELD_IS_INVALID: "Require field is invalid",
    PHONE_NUMBER_WAS_VERIFIED: "Phone number was verified",
    EMAIL_WAS_VERIFIED: "Email was verified",
} as const;
