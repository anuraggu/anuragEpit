/*-----------------------------------------------------------------------
 * @ file        : index.js
 * @ description : Main module to incluse all the Utils files.
 * @ author      : Duddukuri Mahesh
 * @ date        :
 -----------------------------------------------------------------------*/
var STATUS_MSG = {
    SUCCESS: {
        CREATED: {
            statusCode: 201,
            customMessage: 'Created Successfully',
            type: 'CREATED'
        },
        OFFERMADE: {
            statusCode:200,
            customMessage : 'Offer made successfully',
            type : 'OFFERMADE'
        },
        DEFAULT: {
            statusCode: 200,
            customMessage: 'Success',
            type: 'DEFAULT'
        },
        UPDATED: {
            statusCode: 200,
            customMessage: 'Updated Successfully',
            type: 'UPDATED'
        },
        LOGOUT: {
            statusCode: 200,
            customMessage: 'Logged Out Successfully',
            type: 'LOGOUT'
        },
        DELETED: {
            statusCode: 200,
            customMessage: 'Deleted Successfully',
            type: 'DELETED'
        },
        PassWord_Token_Send: {
            statusCode: 200,
            customMessage: 'Your password reset request has been sent to your email id',
            type: 'UPDATED'
        },
        ProfileCompletedSuccessfully: {
            "statusCode": 200,
            // "status": "success",
            "customMessage": "Profile updated successfully.",
            type: 'UPDATED'
        },
    }
}
module.exports = {
    STATUS_MSG: STATUS_MSG,
    systemError: {
        statusCode: 500,
        status: 'error',
        message: 'Technical error ! Please try again later.'
    },
    emailAlreadyExists: {
        statusCode: 103,
        status: "warning",
        message: 'This Email is already registered.'
    },
    contactAlreadyExists: {
        statusCode: 103,
        status: "warning",
        message: 'This contact number is already registered.'
    },
    emailNotExists: {
        statusCode: 103,
        status: "warning",
        message: 'Email is not registered with us.',
        responseType: "EMAIL_NOT_FOUND"
    },
    phnoenumberAlreadyExists: {
        statusCode: 400,
        status: "warning",
        message: 'Phone Number already registered.',
        responseType: "PHONE_ALREADY_EXISTS"
    },
    phoneNumberNotExists: {
        statusCode: 400,
        status: "warning",
        message: 'Phone Number not registered.',
        responseType: "PHONE_NOT_EXISTS"
    },
    registerSuccessfully: {
        statusCode: 200,
        status: "success",
        message: 'Your account has been registered successfully.A verification code has been sent to your Contact number.'
    },
    tokenNotExist: {
        statusCode: 400,
        status: "error",
        message: 'Invalid Token.',
        responseType: "TOKEN_NOT_VALID"
    },
    tokenExpired: {
        statusCode: 401,
        status: "warning",
        message: 'Session Expired.'
    },
    tokenVerified: {
        statusCode: 200,
        status: "success",
        message: 'Token has been verified'
    },
    forgetPassword: {
        statusCode: 200,
        status: "success",
        message: 'A verification code has been sent to your Contact number.'
    },
    resetpassword: {
        statusCode: 200,
        status: "success",
        message: 'A randomly generated password has been sent. Please use that to login and change your password.'
    },
    passwordUpdated: {
        statusCode: 200,
        status: "success",
        message: 'Password updated successfully.'
    },
    forgotPasswordLinkExpired: {
        statusCode: 200,
        status: "success",
        message: 'Forgot Password Token Expired.',
        responseType: "TOKEN_EXPIRED"
    },
    emailChanged: {
        statusCode: 200,
        status: "success",
        message: 'An OTP is sent to the registered email Id. Please use that to verify your email.'
    },
    phoneNumChanged: {
        statusCode: 200,
        status: "success",
        message: 'An OTP is sent to the registered phone number. Please use that to verify your phone number.'
    },
    emailUpdated: {
        statusCode: 200,
        status: "success",
        message: 'Email updated successfully.'
    },
    loginSuccessfull: {
        statusCode: 200,
        status: "success",
        message: 'Logged in successfully.'
    },
    logoutSuccessfull: {
        statusCode: 200,
        status: "success",
        message: 'Logged out successfully.'
    },
    invalidCredentials: {
        statusCode: 400,
        status: "error",
        message: 'Invalid credentials.'
    },
    accountNotConfirmed: {
        statusCode: 103,
        status: "warning",
        message: 'Your account is not confirmed.Please confirm verification link sent your registered email.'
    },
    alreadyExist: {
        statusCode: 103,
        status: "warning",
        message: 'Already exist.'
    },
    idNotExist: {
        statusCode: 103,
        status: "warning",
        customMessage: 'Given id does not exists.',
        message: 'Given id does not exists.',
    },
    invalidsubjobId: {
        statusCode: 103,
        status: "warning",
        customMessage: 'Subjob does not exist for particular tradie.',
        message: 'Subjob does not exist for particular tradie.',
    },
    TradieidNotExist: {
        statusCode: 103,
        status: "warning",
        message: 'Invalid Tradie.'
    },
    CategoryidNotExist: {
        statusCode: 103,
        status: "warning",
        message: 'Invalid category id.'
    },
    jobIdNotExist: {
        statusCode: 103,
        status: "warning",
        message: 'Invalid Job id.'
    },

    profileUpdate: {
        statusCode: 200,
        status: "success",
        message: 'Profile successfully updated.'
    },
    suspended: {
        statusCode: 103,
        status: "warning",
        message: "Your account is suspended or deleted. Please contact admin for further support."
    },
    fileLengthExceeded: {
        statusCode: 103,
        status: "warning",
        customMessage: "File size exceeds the maximum limit. Please upload the file of size less than 5MB.",
        message: "File size exceeds the maximum limit. Please upload the file of size less than 5MB."
    },
    fileNotFound: {
        statusCode: 404,
        status: "warning",
        message: "File not found."
    },
    onlyImagesAllowed: {
        statusCode: 103,
        status: "warning",
        message: "Files with 'jpg', 'jpeg' and 'png' formats are allowed."
    },
    onlyPdfAllowed: {
        statusCode: 103,
        status: "warning",
        message: "Resume should be in doc or pdf format."
    },
    fileWriteError: {
        statusCode: 103,
        status: "warning",
        message: "File write error."
    },
    fileChooseError: {
        statusCode: 103,
        status: "warning",
        message: "Please choose any file."
    },
    jobSaved: {
        statusCode: 200,
        status: "success",
        message: "Job saved successfully."
    },
    jobApplied: {
        statusCode: 400,
        status: "error",

    },
    otpNotValid: {
        statusCode: 400,
        status: "error",
        message: "Please enter the valid OTP.",
        responseType: "OTP_NOT_VALID"
    },
    ConfirmPasswordNotmatch: {
        statusCode: 400,
        status: "error",
        message: "Password and Confirm Password are not smae.",
        responseType: "CONFIRM_PASSWORD_MISMATCH"
    },
    oldAndNewPasswordMatch: {
        statusCode: 103,
        status: "warning",
        message: 'New password should be different than old password.'
    },
    oldPassIncorrect: {
        statusCode: 400,
        status: "error",
        message: "Old password entered is wrong."
    },
    invalidOperation: {
        statusCode: 103,
        status: "warning",
        message: "Invalid operation."
    },
    AccountCannotCreate: {
        statusCode: 103,
        status: "warning",
        message: "Account Cannot Be Created without email ID."
    },
    unauthorizedUser: {
        statusCode: 103,
        status: "warning",
        message: 'You are not an authorized user for this action.'
    },
    emailnotExistForRole: {
        statusCode: 103,
        status: "warning",
        message: 'Email does not exist.'
    },
    userNotExist: {
        statusCode: 103,
        status: "warning",
        message: 'User not exist.'
    },
    phonenumberNotExistForAuth: {
        statusCode: 103,
        status: "warning",
        message: 'PhoneNumber not exist for specific auth.',
        responseType: "AUTH_NOT_VALID"
    },
    forgetPasswordEmail: {
        statusCode: 200,
        status: "success",
        message: 'An OTP is sent to the registered email Id. Please use that OTP to access your account.'
    },
    vehicleCountExceeded: {
        statusCode: 103,
        status: "warning",
        message: 'Unable to add this vehicle. You cannot add more than 10 vehicles. Please remove some to add a new one.'
    },
    vehicleAlreadyPresent: {
        statusCode: 103,
        status: "warning",
        message: 'Unable to add this vehicle. The vehicle is already registered.',
    },
    vehicleAdded: {
        statusCode: 200,
        status: "success",
        message: "Vehicle added successfully."
    },
    vehicleUpdated: {
        statusCode: 200,
        status: "success",
        message: "Vehicle details updated successfully."
    },
    vehicleDeleted: {
        statusCode: 200,
        status: "success",
        message: "Vehicle details deleted successfully."
    },
    vehicleFetched: {
        statusCode: 200,
        status: "success",
        message: "Vehicles fetched successfully."
    },
    vehicleNotFound: {
        statusCode: 103,
        status: "warning",
        message: "Unable to find this vehicle details.",
    },
    actionNotAllowed: {
        statusCode: 103,
        status: "warning",
        message: "You are not allowed to perform this action.",
    },
    noVehicleAdded: {
        statusCode: 103,
        status: "warning",
        message: "No vehicle is added in your profile. Please add a vehicle first to perform this action.",
    },
    contactUs: {
        statusCode: 200,
        status: "success",
        message: 'Your enquiry has been submitted, we will get back to you soon.'
    },
    reportIssue: {
        statusCode: 200,
        status: "success",
        message: 'Your issue has been submitted successfully. We will contact you soon.'
    },
    requestBusinessCarPark: {
        statusCode: 200,
        status: "success",
        message: 'Your request has been submitted successfully. We will contact you soon.'
    },
    updateRadius: {
        statusCode: 200,
        status: "success",
        message: 'Your radius is updated successfully.'
    },
    fetchSpace: {
        statusCode: 200,
        status: "success",
        message: 'Parking space fetched successfully.'
    },
    space_add: {
        statusCode: 200,
        status: "success",
        message: 'Parking space added successfully.'
    },
    deleteSpace: {
        statusCode: 200,
        status: "success",
        message: 'Parking space deleted successfully.'
    },
    updateSpace: {
        statusCode: 200,
        status: "success",
        message: 'Parking space updated successfully.'
    },
    cardAdded: {
        statusCode: 200,
        status: "success",
        message: 'This card is successfully linked with your user account.'
    },
    defaultCardUpdated: {
        statusCode: 200,
        status: "success",
        message: 'This card is successfully set as your default card.'
    },
    cardFetched: {
        statusCode: 200,
        status: "success",
        message: 'Cards fetched successfully.'
    },
    cardDeleted: {
        statusCode: 200,
        status: "success",
        message: 'Card details removed successfully.'
    },
    stripeTokenExpired: {
        statusCode: 103,
        status: "warning",
        message: "There was an error in linking your account. Please enter card details again."
    },
    cardDetailsInvalid: {
        statusCode: 103,
        status: "warning",
        message: "The card details provided are either incorrect or the card is invalid."
    },
    cardInvalid: {
        statusCode: 103,
        status: "warning",
        message: "Payment failed. Card not accepted."
    },
    cardNotPresent: {
        statusCode: 103,
        status: "warning",
        message: "Unable to perform this operation. No card present under this user."
    },
    cardNotExists: {
        statusCode: 103,
        status: "warning",
        message: "The requested card does not exist."
    },
    messageSent: {
        statusCode: 200,
        status: "success",
        message: 'Message sent successfully.'
    },
    messageDeleted: {
        statusCode: 200,
        status: "success",
        message: 'Message deleted successfully.'
    },
    messageThreadFetched: {
        statusCode: 200,
        status: "success",
        message: 'Message thread fetched successfully.'
    },
    messageThreadNotExist: {
        statusCode: 103,
        status: "warning",
        message: "Unable to access this message thread. Message thread is deleted."
    },
    inboxFetched: {
        statusCode: 200,
        status: "success",
        message: 'User inbox fetched successfully.'
    },
    invalidExtendTime: {
        statusCode: 105,
        status: "error",
        message: 'Please select a valid end time.'
    },
    bookingCompleted: {
        statusCode: 201,
        status: "success",
        message: 'Booking request sent successfully.'
    },
    bookingAccepted: {
        statusCode: 200,
        status: "success",
        message: 'Booking request accepted successfully.'
    },
    bookingEnded: {
        statusCode: 200,
        status: "success",
        message: 'Booking ended successfully.'
    },
    bookingPaid: {
        statusCode: 200,
        status: "success",
        message: 'Payment completed successfully.'
    },
    bookingNotFound: {
        statusCode: 103,
        status: "warning",
        message: 'The requested booking data is either updated or deleted.'
    },
    bookingRejected: {
        statusCode: 103,
        status: "warning",
        message: 'Unable to process with this booking, as all the parking spaces are occupied for the provided duration.'
    },
    bookingDeleted: {
        statusCode: 200,
        status: "success",
        message: 'Booking deleted successfully.'
    },
    bookingNotCompleted: {
        statusCode: 103,
        status: "warning",
        message: 'Unable to perform this operation. The requested booking is not yet completed.'
    },
    bookingCancelled: {
        statusCode: 200,
        status: "success",
        message: 'Booking cancelled successfully.'
    },
    parkingSpaces: {
        statusCode: 200,
        status: "success",
        message: 'Parking Spaces fetched successfully.'
    },
    otpVerified: {
        statusCode: 200,
        status: "success",
        message: 'OTP verified successfully.'
    },
    INVALID_PARKING_ID: {
        statusCode: 400,
        status: "warning",
        message: 'Invalid parking id.',
        responseType: "INVALID_PARKING_ID"
    },
    PARKING_SPACE_IS_NOT_AVAILABLE: {
        statusCode: 400,
        status: "warning",
        message: 'Parking space is not available.',
        responseType: "PARKING_SPACE_IS_NOT_AVAILABLE"
    },
    is_available_current: {
        statusCode: 200,
        status: "success",
        message: "Your space is updated as un available today for upcoming users."
    },
    PARKING_SPACE_IS_NOT_UPDATED: {
        statusCode: 103,
        status: "warning",
        message: "You can't perform this action right now."
    },
    userAuthenticated: {
        statusCode: 200,
        status: "success",
        message: 'User authenticated successfully.'
    },
    userNotAuthenticated: {
        statusCode: 103,
        status: "warning",
        message: 'User not authenticated.'
    },
    parkingRequestError: {
        statusCode: 103,
        status: "warning",
        message: '' //custom message
    },
    parkingRequestAccepted: {
        statusCode: 200,
        status: "success",
        message: 'Parking request accepted successfully.'
    },
    parkingRequestRejected: {
        statusCode: 202,
        status: "success",
        message: 'Parking request rejected successfully.'
    },
    parkingRequestsFetched: {
        statusCode: 200,
        status: "success",
        message: "Parking requests fetched successfully."
    },
    reviewFetched: {
        statusCode: 200,
        status: 'success',
        message: 'Review fetched successfully.'
    },
    accountLinked: {
        statusCode: 200,
        status: 'success',
        message: 'User account linked successfully.'
    },
    customAccountError: {
        statusCode: 103,
        status: "warning",
        message: ''
    },
    SPACE_OWNER_ACCOUNT_NOT_EXITS: {
        statusCode: 400,
        status: "warning",
        type: "space_owner_custom_account",
        message: "Please setup your bank account first."
    },
    SPACE_OWNER_ACCOUNT_IS_NOT_VERIFIED: {
        statusCode: 400,
        status: "warning",
        type: "SPACE_OWNER_ACCOUNT_IS_NOT_VERIFIED",
        message: "Your account is not verifiy"
    },
    YOU_CAN_NOT_WITHDRAWAL_AMOUNT: {
        statusCode: 103,
        status: "warning",
        message: "You can't Withdrawal this amount right now.",
        type: "YOU_CAN_NOT_WITHDRAWAL_AMOUNT"
    },
    PARKING_SPACE_NOT_AVAILABLE: {
        statusCode: 400,
        status: "warning",
        message: 'Parking space not available.',
        responseType: "PARKING_SPACE_NOT_AVAILABLE"
    },
    INVALID_EMAIL: {
        statusCode: 400,
        customMessage: 'Invalid email',
        type: 'INVALID_EMAIL'
    },
    FACEBOOKID_ID_PASSWORD_ERROR: {
        statusCode: 400,
        customMessage: 'Only one field can be filled at a time, either facebookId or password',
        type: 'FACEBOOKID_ID_PASSWORD_ERROR'
    },
    LINKEDIN_ID_PASSWORD_ERROR: {
        statusCode: 400,
        customMessage: 'Only one field can be filled at a time, either linkedin or password',
        type: 'LINKEDIN_ID_PASSWORD_ERROR'
    },
    PASSWORD_IS_REQUIRED: {
        statusCode: 400,
        customMessage: 'Password is required',
        type: 'PASSWORD_IS_REQUIRED'
    },
    SOCIAL_MODE_PASSWORD_ERROR: {
        statusCode: 400,
        customMessage: 'Only one field can be filled at a time, either socialmode or password',
        type: 'SOCIAL_MODE_PASSWORD_ERROR'
    },
    EMAIL_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: 'Email already exists',
        type: 'EMAIL_ALREADY_EXIST',
        /*error:{
         errorCode:400,
         errorDescription: 'Email already exists.'
         }*/
    },
    INVALID_EMAIL_PASSWORD: {
        statusCode: 400,
        customMessage: 'Invalid email or password',
        type: 'INVALID_EMAIL_PASSWORD',
        /*error:{
         errorCode:400,
         errorDescription: 'Invalid email or password.'
         }*/
    },
    USER_NOT_FOUND: {
        statusCode: 400,
        customMessage: "User doesn't exist",
        type: 'USER_NOT_FOUND',
    },
    CATEGORY_NOT_VALID: {
        statusCode: 400,
        customMessage: "category should contain valid MongoDb Id.",
        type: 'CATEGORY_NOT_VALID',
    },
    SELECT_ATLEAST_ONE_CATEGORY: {
        statusCode: 400,
        customMessage: "Please select atleast one category.",
        type: 'SELECT_ATLEAST_ONE_CATEGORY',
    },
    INCORRECT_OLD_PASS: {
        statusCode: 400,
        customMessage: 'Incorrect current password',
        type: 'INCORRECT_OLD_PASS'
    },
    SAME_PASSWORD: {
        statusCode: 400,
        customMessage: 'New password should be different from old password.',
        type: 'SAME_PASSWORD'
    },
    TOKEN_NOT_VALID: {
        statusCode: 401,
        status: "error",
        customMessage: 'Session Expired.',
        type: "TOKEN_NOT_VALID"
    },
    TOKEN_EXIRED: {
        statusCode: 401,
        status: "warning",
        message: 'Session Expired.',
        type: "TOKEN_EXPIRED"
    },
    INVALID_USER_ID: {
        statusCode: 400,
        customMessage: 'Invalid user id',
        type: 'INVALID_USER_ID'
    },
    INVALID_CATEGORY_ID: {
        statusCode: 400,
        customMessage: 'Please fill valid category id',
        type: 'INVALID_CATEGORY_ID'
    },
    FACEBOOK_ID_EXIST: {
        statusCode: 400,
        customMessage: 'facebook already exists',
        type: 'FACEBOOK_ID_EXIST',
        /*error:{
         errorCode:400,
         errorDescription: 'Email already exists.'
         }*/
    },
    LINKEDINID_ID_EXIST: {
        statusCode: 400,
        customMessage: 'linkedinId already exists',
        type: 'LINKEDINID_ID_EXIST',
        /*error:{
         errorCode:400,
         errorDescription: 'Email already exists.'
         }*/
    },
    FACEBOOK_AND_LINKEDIN_ID: {
        statusCode: 400,
        customMessage: 'Only one field can be filled at a time, either facebookId or linkedinId',
        type: 'FACEBOOK_AND_LINKEDIN_ID'
    },
    INCORRECT_SOCIAL_MODE: {
        statusCode: 400,
        customMessage: 'Incorrect social mode',
        type: 'INCORRECT_SOCIAL_MODE'
    },
    SOCIAL_MODE_IS_REQUIRED: {
        statusCode: 400,
        customMessage: 'Social mode is required',
        type: 'SOCIAL_MODE_IS_REQUIRED'
    },
    MAXIMUM_IMAGE_UPLOAD: {
        statusCode: 400,
        customMessage: 'You can upload maximum 4 images',
        type: 'MAXIMUM_IMAGE_UPLOAD'
    },
    INVALID_JOB_ID: {
        statusCode: 400,
        status: "warning",
        message: 'Given job id does not exists.',
        type: 'INVALID_JOB_ID'
    },
    ALREADY_BID_ON_CATEGORY: {
        statusCode: 400,
        status: "warning",
        message: 'Already bid on this job.',
        type: 'ALREADY_BID_ON_CATEGORY'
    },
    INVALID_EXPECTED_START_DATE: {
        statusCode: 400,
        status: "warning",
        message: 'Invalid expected Start Date.',
        type: 'INVALID_EXPECTED_START_DATE'
    },
    USER_IS_NOT_VERIFY: {
        statusCode: 400,
        customMessage: 'This email id is not verified',
        type: 'USER_IS_NOT_VERIFY',
    },
    EMAIL_IS_NOT_VERIFY: {
        statusCode: 400,
        customMessage: 'Please verify your email',
        type: 'EMAIL_IS_NOT_VERIFY',
    },
    LICENSE_NUMBER_ALREADY_EXIST: {
        statusCode: 400,
        customMessage: 'License Number already exists.',
        type: 'LICENSE_NUMBER_ALREADY_EXIST',
    },
    LICENSE_NUMBER_NOT_VERIFY: {
        statusCode: 400,
        customMessage: 'License Number/Categories are not verified yet',
        type: 'LICENSE_NUMBER_NOT_VERIFY',
    },
    TRADEMEN_BID_OWN_JOB: {
        statusCode: 400,
        customMessage: "You can't perform this action right now",
        type: 'TRADEMEN_BID_OWN_JOB'
    },
    INVALID_MONGOID: {
        statusCode: 400,
        status: "error",
        customMessage: 'Job id must be valid MongoDb id',
        type: 'INVALID_MONGOID',
    },
    NOT_BID_FOR_JOB: {
        statusCode: 400,
        status: "error",
        customMessage: 'Invalid Tradie',
        type: 'NOT_BID_FOR_JOB',
    },
    USER_TYPE_CHANDED: {
        statusCode: 200,
        customMessage: 'User type chanded',
        type: 'USER_TYPE_CHANDED',
    },
    USER_IS_ALREADY_TRADEMEN: {
        statusCode: 400,
        customMessage: 'user is already trademen',
        type: 'USER_IS_ALREADY_TRADEMEN',
    },
    PLEASE_FILL_VALID_JOB_ID: {
        statusCode: 400,
        status: "error",
        message: 'Please fill valid job id.',
        type: 'PLEASE_FILL_VALID_JOB_ID'
    },
    BANK_DETAILS_NOT_FILLED: {
        statusCode: 400,
        status: "error",
        customMessage: 'Please fill bank details to hire a tradie',
        type: 'EMPTY_BANK_DETAILS',

    },
    CONTACT_DETAILS_NOT_FILLED: {
        statusCode: 400,
        status: "error",
        customMessage: 'Please fill contact details to hire a tradie',
        type: 'EMPTY_CONTACT_DETAILS',

    },
    JOB_CREATED_PAST_DAY: {
        statusCode: 400,
        customMessage: "You can't create a job of past day",
        type: 'JOB_CREATED_PAST_DAY'
    },
    TRADEE_IN_FAVORITE: {
        statusCode: 400,
        //status: "error",
        customMessage: "Tradee already exists in favorite list.",
        type: 'TRADEE_IN_FAVORITE'
    },
    TRADEE_NOT_IN_FAVORITE: {
        statusCode: 400,
        status: "error",
        customMessage: "Tradee is not in your favorite list.",
        type: 'TRADEE_NOT_IN_FAVORITE'
    },
    YOU_ARE_REGISTERED_USING_SOCIAL_MEDIA: {
        statusCode: 400,
        status: "error",
        customMessage: "You are registered via Social media",
        type: 'YOU_ARE_REGISTERED_USING_SOCIAL_MEDIA'
    },
    RemovedFromFavorite: {
            statusCode: 200,
            customMessage: 'Tradee removed from favorite successfully',
            type: 'UPDATED'
    },
    AddedFavorite: {
            statusCode: 200,
            customMessage: 'Tradee added to favorite successfully',
            type: 'CREATED'
    },
    EMAILNOTVERIFY: {
        statusCode:200,
        customMessage : 'Registered successfully. Please verify your email',
        type : 'EMAILNOTVERIFY'
    },
    PLEASE_ADD_ATLEAST_ONE_CARD: {
        statusCode:400,
        customMessage : 'Please add atleast one card',
        type : 'PLEASE_ADD_ATLEAST_ONE_CARD'
    },
    INVALID_SUB_JOB_ID: {
        statusCode: 400,
        customMessage: 'Please fill valid subjob id',
        type: 'INVALID_SUB_JOB_ID'
    },
    PLEASE_ADD_CARD: {
        statusCode: 400,
        status: "error",
        customMessage: 'Please add card to hire a tradie',
        type: 'PLEASE_ADD_CARD',

    },
    YOU_ALREADY_HIRED_TRADIE:{
        statusCode: 400,
        status: "error",
        customMessage: 'you already hire tradie',
        type: 'YOU_ALREADY_HIRED_TRADIE',
    },
    JOB_NOT_DELETED: {
        statusCode: 400,
        customMessage: "You can't perform this action right now",
        type: 'JOB_NOT_DELETED'
    },
    SUB_JOB_STATUS_NOT_APPROVED: {
        statusCode: 400,
        customMessage: "You can't perform this action right now",
        type: 'SUB_JOB_STATUS_NOT_APPROVED'
    },
    JOB_STATUS_NOT_HIRED: {
        statusCode: 400,
        customMessage: "You can't perform this action right now",
        type: 'JOB_STATUS_NOT_HIRED'
    },
    YOU_ALREADY_APPROVED_TRADIE:{
        statusCode: 400,
        status: "error",
        customMessage: 'you already approved tradie',
        type: 'YOU_ALREADY_APPROVED_TRADIE',
    },
    MULTIPLE_DELETED_JOB_CATEGORY: {
        statusCode: 400,
        customMessage: "You can't perform this action right now",
        type: 'MULTIPLE_DELETED_JOB_CATEGORY'
    },
    HIRED_TRADIE_SUCCESSFULLY: {
        statusCode:200,
        customMessage : 'Hired Successfully',
        type : 'HIRED_TRADIE_SUCCESSFULLY'
    },



};