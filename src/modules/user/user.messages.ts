export const USER_MESSAGES = {
    // username
    USERNAME_IS_REQUIRED: 'Username is required',
    USERNAME_MUST_BE_STRING: 'Username must be a string',
    USERNAME_LENGTH_MUST_BE_FROM_1_TO_50:
        'Username must be between 1 and 50 characters',
    USERNAME_MUST_CONTAIN_ALPHABET: 'Username must contain alphabet',

    // email
    EMAIL_IS_REQUIRED: 'Email is required',
    EMAIL_IS_INVALID: 'Email is invalid',

    // phone number
    PHONE_NUMBER_IS_REQUIRED: 'Phone number is required',
    PHONE_NUMBER_MUST_BE_STRING: 'Phone number must be a string',
    PHONE_NUMBER_IS_INVALID: 'Phone number is invalid',

    // password
    PASSWORD_IS_REQUIRED: 'Password is required',
    PASSWORD_MUST_BE_STRING: 'Password must be a string',
    PASSWORD_MUST_BE_STRONG: 'Password must be strong',

    // confirm password
    CONFIRM_PASSWORD_MUST_MATCH_PASSWORD:
        'Confirm password must match password',

    // first name
    FIRST_NAME_IS_REQUIRED: 'First name is required',
    FIRST_NAME_MUST_BE_STRING: 'First name must be a string',
    FIRST_NAME_LENGTH_MUST_BE_FROM_1_TO_50:
        'First name must be between 1 and 50 characters',

    // last name
    LAST_NAME_IS_REQUIRED: 'Last name is required',
    LAST_NAME_MUST_BE_STRING: 'Last name must be a string',
    LAST_NAME_LENGTH_MUST_BE_FROM_1_TO_50:
        'Last name must be between 1 and 50 characters',

    // user messages
    REGISTER_SUCCESS: 'Register successfully',
    REGISTER_FAILED: 'Register failed',

    // register
    USERNAME_ALREADY_EXISTS: 'Username is already exist',
    EMAIL_ALREADY_EXISTS: 'Email is already exist',

    // login
    FIELD_IS_REQUIRED: 'Username, email or phone number is required',
    USERNAME_NOT_FOUND: 'Username is not found',
    PASSWORD_IS_WRONG: 'Password is wrong',
    EMAIL_NOT_FOUND: 'Email is not found',
    PHONE_NUMBER_NOT_FOUND: 'Phone number is not found',
    LOGIN_SUCCESS: 'Login successfully',

    // error messages
    UNPROCESSABLE_ENTITY: 'Validation: Unprocessable Entity'
} as const
