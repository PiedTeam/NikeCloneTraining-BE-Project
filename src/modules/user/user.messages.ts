export const USERS_MESSAGES = {
    // Username
    USERNAME_IS_REQUIRED: 'Name is required',
    USERNAME_MUST_BE_A_STRING: 'Name must be a string',
    USERNAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',

    // First Name
    FIRST_NAME_IS_REQUIRED: 'First name is required',
    FIRST_NAME_MUST_BE_A_STRING: 'First name must be a string',
    FIRST_NAME_LENGTH_MUST_BE_FROM_1_TO_100:
        'First name length must be from 1 to 100',

    // Last Name
    LAST_NAME_IS_REQUIRED: 'Last name is required',
    LAST_NAME_MUST_BE_A_STRING: 'Last name must be a string',
    LAST_NAME_LENGTH_MUST_BE_FROM_1_TO_100:
        'Last name length must be from 1 to 100',

    // Email
    EMAIL_IS_REQUIRED: 'Email is required',
    EMAIL_IS_INVALID: 'Email is invalid',
    EMAIL_ALREADY_EXISTS: 'Email already exists',

    // Password
    PASSWORD_IS_REQUIRED: 'Password is required',
    PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
    PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50:
        'Password length must be from 8 to 50',
    PASSWORD_MUST_BE_STRONG: 'Password must be strong',

    // Confirm Password
    CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
    CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
    CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50:
        'Confirm password length must be from 8 to 50',
    CONFIRM_PASSWORD_MUST_BE_STRONG: 'Confirm password must be strong',
    CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD:
        'Confirm password must be the same as password',

    //Phone
    PHONE_NUMBER_IS_REQUIRED: 'Phone number is required',
    PHONE_NUMBER_MUST_BE_A_STRING: 'Phone number must be a string',
    PHONE_NUMBER_IS_INVALID: 'Phone number is invalid',
    PHONE_NUMBER_LENGTH_MUST_BE_10: 'Phone number length must be 10',

    // User messages
    REGISTER_SUCCESS: 'Register successfully',
    REGISTER_FAIL: 'Register failed'
} as const
