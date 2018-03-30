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

//verify email
var verifyEmailToken = {
    method: 'POST',
    path: '/v1/user/verifyEmailToken',
    config: {
        description: 'Api to verify email token ',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                emailVerificationToken: Joi.string().required().label('Token'),
                // email: Joi.string().lowercase().required().label('Email'),
                email: Joi.string().trim().required().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),

            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.verifyEmailToken(request.payload, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(err);
            } else {
                reply(data)
            }
        });
    },
}

var getAllUsers = {
    method: 'GET',
    path: '/v1/user/getAllUsers',
    config: {
        description: 'api to get list of all the users',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.getAllUsers(request.payload, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(err);
            } else {
                reply(data)
            }
        });
    },
}

var editConsumerProfile = {
    method: 'PUT',
    path: '/v1/user/editConsumerProfile',
    config: {
        description: 'Api route to edit profile of Consumer (Test this API On postman as it contains multipart data).',
        tags: ['api', 'User'],
        pre: [{method: checkAccessToken, assign: 'verify'}],
        payload: {
            maxBytes: IMG_SIZE.SIZE,
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },
        validate: {
            payload: {
                name: Joi.string().lowercase().trim().min(2).max(30).optional().allow('').label('Name'),
                //email: Joi.string().email().required().lowercase().label('Email'),
                phone: Joi.string().required().required().label('Contact number'),
                //phone: Joi.string().required().regex(/^\+(?:[0-9\-] ?){10,14}[0-9 ]$/).options({language: {string: {regex: {base: "should be valid (Eg: +44 12 3456 7890)"}}}}).required().label('Contact number'),
                longitude: Joi.number().required().label('Longitude'),
                lattitude: Joi.number().required().label('Lattitude'),
                location_name: Joi.string().optional().label('Location name'),
                about_yourself: Joi.string().optional().allow('').label('About Yourself'),
                profile_pic: Joi.any().optional().allow('').label('Profile pic')
            },
            headers: Joi.object({'accesstoken': Joi.string().trim().required()}).options({allowUnknown: true}),
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.editConsumerProfile(request.payload, request.pre.verify.userData[0], function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(err);
            } else {
                reply(data)
            }
        });
    },
}
var accessUserImagesOnServer = {
    method: 'GET',
    path: '/v1/user/accessUserImagesOnServer',
    config: {
        description: 'user get  Invoice ',
        tags: ['api', 'contractor'],
        handler: function (request, reply) {
            return reply.file('./Assets/' + request.query.fileName);
            //return reply.file(request.query.fileName);
        },
        validate: {
            query: {
                fileName: Joi.string().required(),
            },
            failAction: FailActionFunction,
        }
    }
}

var getLoggedInUserData = {
    method: 'GET',
    path: '/v1/user/getLoggedInUserData',
    config: {
        description: 'Api to get details of logged in user.',
        tags: ['api', 'User'],
        pre: [{method: checkAccessToken, assign: 'verify'}],
        //auth: 'CustomerAuth',
        validate: {
            headers: Joi.object({
                'accesstoken': Joi.string().trim().required()
            }).options({allowUnknown: true}),
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        var UserData = request.pre.verify.userData[0];
        Controller.UserController.getUserDataApi(UserData, function (err, data) {
            if (err) {
                reply(err);
            } else {
                reply(sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.Data_fetched, data)).code(200)
            }
        });
    },
}
var verifyLicense = {
    method: 'PUT',
    path: '/v1/admin/verifyLicense',
    config: {
        description: 'Api to verify license of trademen.',
        tags: ['api', 'Admin'],
        // pre: [{method: checkAccessToken, assign: 'verify'}],
        validate: {
            payload: {
                trademenId: Joi.string().length(24).required().label('trademen Id')
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.verifyLicense(request.payload, function (err, data) {
            if (err) {
                reply(err);
            } else {
                reply({
                    'statusCode': 200,
                    'status': 'success',
                    'message': 'License verified successfully.'
                })
            }
        });
    },
}
var contactUs = {
    method: 'POST',
    path: '/v1/user/contactUs',
    config: {
        description: 'Api for contact us page(admin emails will be sent to tradePeopleAdmin12@yopmail.com).',
        tags: ['api'],
        pre: [{method: checkAccessToken, assign: 'verify'}],
        validate: {
            payload: {
                email: Joi.string().trim().required().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),
                description: Joi.string().required().label('Description')
            },
            headers: Joi.object({
                'accesstoken': Joi.string().trim().required()
            }).options({allowUnknown: true}),
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        var UserData = request.pre.verify.userData[0];
        Controller.UserController.contactUs(request.payload, UserData, function (err, data) {
            if (err) {
                reply(err);
            } else {
                reply({
                    'statusCode': 200,
                    'status': 'success',
                    'message': 'Message sent successfully.'
                })
            }
        });
    },
}
var notification = {
    method: 'GET',
    path: '/v1/user/notification',
    config: {
        description: 'get notification.',
        tags: ['api', 'Consumer'],
        pre: [{method: checkAccessToken, assign: 'verify'}],
        validate: {
            query: {
                skip: Joi.number().required(),
                limit: Joi.number().required(),
                searchKeyWord:Joi.string().optional()

            },
            headers: Joi.object({'accesstoken': Joi.string().trim().required()}).options({allowUnknown: true}),
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        var UserData = request.pre.verify.userData[0];
        Controller.UserController.notification(request.query, UserData, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                reply(sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
            }
        });
    },
}

var testPushNotifications = {
    method: 'POST',
    path: '/v1/test/testPushNotifications',
    config: {
        description: 'get notification.',
        tags: ['api', 'test'],
        validate: {
            payload: {
                message: Joi.string().required().label('Message'),
                device_token: Joi.string().required().label('device_token'),
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.UserController.testPushNotifications(request.payload, function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(err);
            } else {
                reply(data)
            }
        });
    },
}

var turnOnOffNotification = {
    method: 'PUT',
    path: '/v1/user/toggleNotification',
    config: {
        description: 'Api route to toggle notification settings of a user',
        notes: 'Api route to toggle notification settings of a user',
        tags: ['api'],
        pre: [{method: checkAccessToken, assign: 'verify'}],
        validate: {
            payload: {
                is_notification: Joi.boolean().required().label('Notification')
            },
            headers: Joi.object({'accesstoken': Joi.string().trim().required()}).options({allowUnknown: true}),
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        var UserData = request.pre.verify.userData[0];
        Controller.UserController.toggleNotification(request.payload,UserData, function (err, res) {
            if (err) {
                reply(err);
            } else {
                reply({
                    statusCode: "200",
                    status: "success",
                    message: "Your notifications are turned " + ((res == true) ? "on" : "off") + " successfully",
                    results: {
                        "notification": res
                    }
                });
            }
        })
    }
};
module.exports = [
    registerUser,
    login,
    changedPasword,
    forgotPassword,
    resetForgotPassword,
    verifyForgotPasswordToken,
    logOut,
    resentEmailVerificationLink,
    verifyEmailToken,
    getAllUsers,
    editConsumerProfile,
    accessUserImagesOnServer,
    getLoggedInUserData,
    contactUs,
    notification,
    testPushNotifications,
    turnOnOffNotification
    //verifyLicense
]