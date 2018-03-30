/*----------------------------------------------------------------------------------
   * @ file        : appConstants.js
   * @ description : It includes all the Constant values using in the application.
   * @ author      : Anurag Gupta
   * @ date        :
-----------------------------------------------------------------------------------*/
var GOOGLE_TIMEZONE_API__KEY = "AIzaSyDdlo-rcKhsd2APXiW0Ja37XX2lQivwCPI";
var SOCIAL_MODE = {
    FACEBOOK: "Facebook",
    LINKEDIN: "Linkedin"
}

var DEVICE_TYPE = {
    ANDROID: "Android",
    IOS: "IOS"
}
var IMG_SIZE = {
    SIZE: 1048576 * 50
}
var MaxImagesUpload = 4;
var USER_TYPE = {
    STUDENT: "Student",
    ADMIN: "Admin",
}
var MaxDistance = 100000;


var STATUS_MSG ={
	SUCCESS: {
		CREATED: {
			statusCode:201,
			customMessage : 'Created Successfully',
			type : 'CREATED'
		},
		DEFAULT: {
			statusCode:200,
			customMessage : 'Success',
			type : 'DEFAULT'
		},
        OFFERMADE: {
			statusCode:200,
			customMessage : 'Offer made successfully',
			type : 'OFFERMADE'
		},

		EMAILNOTVERIFY: {
			statusCode:200,
			customMessage : 'Registered successfully. Please verify your email',
			type : 'EMAILNOTVERIFY'
		},
		UPDATED: {
			statusCode:200,
			customMessage : 'Updated Successfully',
			type : 'UPDATED'
		},
		LOGOUT: {
			statusCode:200,
			customMessage : 'Logged Out Successfully',
			type : 'LOGOUT'
		},
		DELETED: {
			statusCode:200,
			customMessage : 'Deleted Successfully',
			type : 'DELETED'
		},
		PassWord_Token_Send: {
			statusCode:200,
			customMessage : 'Your password reset request has been sent to your email id',
			type : 'UPDATED'
		},
		Data_fetched: {
			statusCode:200,
			customMessage : 'User data fetched successfully.',
			type : 'DATA_FETCHED'
		},
        FORGOT_PASSWORD_LINK_SEND: {
			statusCode:200,
			customMessage : 'Forgot password link sent to your email',
			type : 'FORGOT_PASSWORD_LINK_SEND'
		}
}
}

module.exports = {

    jwtAlgo: 'HS512',
    jwtkey: 'anurag12345',    
    bcryptSaltRound: '',
    noReplyEmail: 'admin@pways.com',
    GOOGLE_TIMEZONE_API__KEY: GOOGLE_TIMEZONE_API__KEY,
    SOCIAL_MODE: SOCIAL_MODE,
    STATUS_MSG: STATUS_MSG,
    DEVICE_TYPE: DEVICE_TYPE,
    USER_TYPE: USER_TYPE,
    IMG_SIZE: IMG_SIZE,
    MaxDistance: MaxDistance,
    MaxImagesUpload: MaxImagesUpload,
    
}