/*--------------------------------------------
 * Include internal modules.
 ---------------------------------------------*/
//var UniversalFunctions = require('../Utils/commonfunctions');
var Config = require('../Configs');
var APP_CONSTANTS = Config.CONSTS;
var SOCIAL_MODE = APP_CONSTANTS.SOCIAL_MODE;
var DEVICE_TYPE = APP_CONSTANTS.DEVICE_TYPE;
var USER_TYPE = APP_CONSTANTS.USER_TYPE;
var IMG_SIZE = APP_CONSTANTS.IMG_SIZE;
var Controller = require('../Controllers');
var FailActionFunction = require('../Utils/universalfunctions').failActionFunction;
var sendSuccess = require('../Utils/universalfunctions').sendSuccess;
var sendError = require('../Utils/universalfunctions').sendError;
var allowAccessTokenInHeader = require('../Utils/universalfunctions').allowAccessTokenInHeader;

var checkAccessToken = require('../Utils/universalfunctions').getTokenFromDB;


/*--------------------------------------------
 * Include external modules.
 ---------------------------------------------*/
var Joi = require('joi');


var registerUser = {
    method: 'POST',
    path: '/v1/user/registerUser',
    config: {
        description: 'Add User',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                name: Joi.string().lowercase().trim().min(2).optional(),
                // email: Joi.string().email().lowercase().required(),
                email: Joi.string().trim().required().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),
                //countryCode:Joi.string().optional().trim(),
                //password: Joi.string().optional().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,16}$/).options({language: {string: {regex: {base: 'must contain atleast 8 characters including a number'}}}}).label('Password'),
                password: Joi.string().optional().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({language: {string: {regex: {base: ' should be between 8-14 characters and must be alphanumeric.'}}}}).label('Password'),
                facebookId: Joi.string().optional().trim(),
                linkedinId: Joi.string().optional().trim(),
                socialMode: Joi.string().optional().valid([SOCIAL_MODE.FACEBOOK, SOCIAL_MODE.LINKEDIN]),
                user_type: Joi.string().required().valid([USER_TYPE.STUDENT]),//USER_TYPE.TRADEMEN,
                device_type: Joi.string().required().valid([DEVICE_TYPE.IOS, DEVICE_TYPE.ANDROID]),
                device_token: Joi.string().required(),
                isEmailVerify: Joi.boolean().required().label('isEmailVerify'),
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.registerUser(request.payload, {}, (err, data)=> {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {//console.log("xxxxx", data);
                //reply(sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data)).code(200)
                if (!data.userDetails.isEmailVerified) {
                    var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.EMAILNOTVERIFY
                } else {
                    var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
                }
                reply(sendSuccess(messageObject, data.userDetails)).header('accessToken', data.accessToken);
            }
        });
    },
}

var login = {
    method: 'POST',
    path: '/v1/user/login',
    config: {
        description: 'login',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                // email: Joi.string().email().lowercase().optional(),
                email: Joi.string().trim().optional().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),
                //password: Joi.string().optional().regex(/^[0-9a-zA-Z]{8,15}$/).options({language: {string: {regex: {base: 'must contain atleast 8 characters including a number'}}}}).label('Password'),
                //password: Joi.string().optional().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({language: {string: {regex: {base: 'should be between 8-14 characters and must be alphanumeric.'}}}}).label('Password'),
                password: Joi.string().optional().label('Password'),
                facebookId: Joi.string().optional().trim(),
                linkedinId: Joi.string().optional().trim(),
                device_token: Joi.string().required(),
                USER_TYPE: Joi.string().required().valid([USER_TYPE.CONSUMER, USER_TYPE.TRADEMEN]),
                device_type: Joi.string().required().valid([DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS]),
                socialMode: Joi.string().optional().valid([SOCIAL_MODE.FACEBOOK, SOCIAL_MODE.LINKEDIN]),
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.login(request.payload, {}, (err, data)=> {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                console.log("data.userDetails.isEmailVerified", data.userDetails.isEmailVerified);
                if (!data.userDetails.isEmailVerified) {
                    console.log("if", data.userDetails);
                    var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.EMAILNOTVERIFY
                } else {
                    console.log("else");
                    var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
                }
                var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
                reply(sendSuccess(messageObject, data.userDetails)).header('accessToken', data.accessToken);
            }
        });
    },
}

var changedPasword = {
    method: 'POST',
    path: '/v1/user/changedPasword',
    config: {
        description: 'changed Pasword',
        tags: ['api', 'user'],
        pre: [{method: checkAccessToken, assign: 'verify'}],
        handler: function (request, reply) {
            console.log("IsDeleted", request.pre.verify);
            var UserData = request.pre.verify.userData[0];
            console.log("headers", request.headers);
            Controller.UserController.ChangedPassword(request.payload, UserData, function (err, data) { //console.log("IsDeleted",data);
                if (err) {
                    reply(sendError(err));
                } else {
                    reply(sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data)).code(200)
                }
            })
        },
        validate: {
            failAction: FailActionFunction,
            headers: Joi.object({'accesstoken': Joi.string().trim().required()}).options({allowUnknown: true}),
            payload: {
                //newPassword: Joi.string().min(8).required(),
                newPassword: Joi.string().required().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({language: {string: {regex: {base: 'should be between 8-14 characters and must be alphanumeric.'}}}}).label('newPassword'),
                //oldPassword: Joi.string().required().trim().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({language: {string: {regex: {base: 'should be between 8-14 characters and must be alphanumeric.'}}}}).label('oldPassword'),
                oldPassword: Joi.string().required(),
            }
        },
        plugins: {
            'hapi-swagger': {
                //payloadType: 'form',
            }
        }
    }
}


var forgotPassword = {
    method: 'POST',
    path: '/v1/user/forgotPassword',
    config: {
        description: 'api to send forgot password link to user',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                // email: Joi.string().email().lowercase().required(),
                email: Joi.string().trim().required().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),

            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.forgotPassword(request.payload, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                //reply(data);
                reply(sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.FORGOT_PASSWORD_LINK_SEND)).code(200)
            }
        });
    },
}

var resetForgotPassword = { //reset forgot password api
    method: 'POST',
    path: '/v1/user/resetForgotPassword',
    config: {
        description: 'api to reset forgot password ',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                forgotPasswordToken: Joi.string().required().label('Token'),
                password: Joi.string().required().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({language: {string: {regex: {base: ' should be between 8-14 characters and must be alphanumeric'}}}}).label('Password'),
                confirm_password: Joi.string().required().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({language: {string: {regex: {base: ' should be between 8-14 characters and must be alphanumeric'}}}}).label('Confirm Password'),
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.resetForgotPassword(request.payload, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(err);
            } else {
                reply(data)
            }
        });
    },
}

//verify forgot password link
var verifyForgotPasswordToken = {
    method: 'POST',
    path: '/v1/user/verifyForgotPasswordToken',
    config: {
        description: 'Api to verify forgot password Token ',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                forgotPasswordToken: Joi.string().required().label('Token'),
                // email: Joi.string().required().label('Token'),
                email: Joi.string().trim().required().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),

            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.verifyForgotPasswordToken(request.payload, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(err);
            } else {
                reply({
                    "statusCode": 200,
                    "status": "success",
                    "message": "Token verified successfully."
                })
            }
        });
    },
}


var logOut = {
    method: 'PUT',
    path: '/v1/user/logout',          //logout api
    config: {
        description: 'User Logout',
        notes: 'Logout from the system',
        tags: ['api'],
        pre: [{method: checkAccessToken, assign: 'verify'}],
        validate: {
            failAction: FailActionFunction,
            headers: Joi.object({'accesstoken': Joi.string().trim().required()}).options({allowUnknown: true}),
            payload: {
                //accessToken: Joi.string().required(),
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        console.log("asdasd", request.pre.verify);
        var UserData = request.pre.verify.userData[0];
        Controller.UserController.Logout(request.payload, UserData, function (err, res) {
            if (err) reply(sendError(err));
            reply(sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT)).code(200);
        });
    }
}
//resent email verification link
var resentEmailVerificationLink = {
    method: 'POST',
    path: '/v1/user/resentEmailVerificationLink',
    config: {
        description: 'Api to sent email verification link again.',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                // email: Joi.string().email().lowercase().required()
                email: Joi.string().trim().required().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),

            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.resentEmailVerificationLink(request.payload, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(err);
            } else {
                reply(data)
            }
        });
    }

}

module.exports = [
    registerUser,
    login,
    changedPasword,
    forgotPassword,
    resetForgotPassword,
    verifyForgotPasswordToken,
    logOut,
    
    //verifyLicense
]