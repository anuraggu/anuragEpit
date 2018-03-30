/*--------------------------------------------
 * Include internal modules.
 ---------------------------------------------*/


const Models = require('../Models');
const Utils = require('../Utils');
const Configs = require('../Configs');
var APP_CONSTANTS = Configs.CONSTS;
const env = require('../env');
const logger = Utils.logger;
const STATUS_MSG = Utils.responses.STATUS_MSG.SUCCESS //Configs.app.STATUS_MSG.SUCCESS;
var Responses = Utils.responses
var Service = require("../Services");
var USER_TYPE = APP_CONSTANTS.USER_TYPE;
const SOCIAL_MODE = APP_CONSTANTS.SOCIAL_MODE;
const DBCommonFunction = Utils.DBCommonFunction;
//const paymentController = require("./paymentController");

/*--------------------------------------------
 * Include external modules.
 ---------------------------------------------*/
const async = require('async');
const jwt = require('jsonwebtoken');
const path = require('path')
const fs = require('fs');
const _ = require('underscore');
const moment = require('moment');
const Mongoose = require('mongoose');
var mongoose = require('mongoose');
var Path = require('path');


var registerUser = function (payloadData, userData, CallbackRoute) {
    console.log("====registerUser==init===");
    var returnedData, token, verificationToken, registerSocialId;
    var RunQuery = "Insert", socialIdExits = false, isEmailUpdate = false;
    async.auto({
        verifyEmailAddress: [(cb)=> {
            if (!Utils.universalfunctions.verifyEmailFormat(payloadData.email)) return cb(Responses.INVALID_EMAIL);
            return cb();
        }],
        ValidateForfacebookIdAndPassword: [(cb)=> {
            if (payloadData.facebookId && payloadData.linkedinId) {
                return cb(Responses.FACEBOOK_AND_LINKEDIN_ID);
            } else if (payloadData.facebookId) {
                if (payloadData.password) return cb(Responses.FACEBOOKID_ID_PASSWORD_ERROR);
                if (!payloadData.socialMode) return cb(Responses.SOCIAL_MODE_IS_REQUIRED);
                registerSocialId = true;
                return cb();
            } else if (payloadData.linkedinId) {
                if (payloadData.password) return cb(Responses.FACEBOOKID_ID_PASSWORD_ERROR);
                if (!payloadData.socialMode) return cb(Responses.SOCIAL_MODE_IS_REQUIRED);
                registerSocialId = true;
                return cb();
            } else if (!payloadData.password) {
                return cb(Responses.PASSWORD_IS_REQUIRED);
            } else if (payloadData.password) {
                if (payloadData.socialMode) {
                    return cb(Responses.SOCIAL_MODE_PASSWORD_ERROR);
                } else {
                    return cb();
                }
            } else {
                return cb();
            }
        }],//SOCIAL_MODE
        checkSocialMode: [(cb)=> {
            if (payloadData.linkedinId && payloadData.socialMode != SOCIAL_MODE.LINKEDIN) {
                return cb(Responses.INCORRECT_SOCIAL_MODE);
            } else if (payloadData.facebookId && payloadData.socialMode != SOCIAL_MODE.FACEBOOK) {
                return cb(Responses.INCORRECT_SOCIAL_MODE);
            } else {
                return cb();
            }
        }],
        getUserData: ['verifyEmailAddress', 'ValidateForfacebookIdAndPassword', 'checkSocialMode', (r1, cb)=> {
            console.log("getUserData init", RunQuery)
            var getCriteria = {
                email: payloadData.email,
            };
            if (payloadData.facebookId) {
                var getCriteria = {
                    facebookId: payloadData.facebookId
                }
                //getCriteria.facebookId=payloadData.facebookId
                var getCriteria = {
                    $or: [
                        {facebookId: payloadData.facebookId},
                        {email: payloadData.email}
                    ]
                }
            }
            if (payloadData.linkedinId) {
                /*var getCriteria = {
                 linkedinId:payloadData.linkedinId
                 }*/
                //getCriteria.linkedinId=payloadData.linkedinId
                var getCriteria = {
                    $or: [
                        {linkedinId: payloadData.linkedinId},
                        {email: payloadData.email}
                    ]
                }
            }
            ;// console.log("getCriteria", getCriteria);
            Service.UserService.getUser(getCriteria, {password: 0, accessToken: 0}, {}, function (err, data) {
                console.log("getUserData", err, data)
                if (err) return cb({errorMessage: 'DB Error: ' + err})
                if (data && data.length > 0 && data[0].email) {
                    returnedData = data[0];
                    console.log("RunQuery__if_data", returnedData.facebookId);
                    if (payloadData.facebookId || payloadData.linkedinId) {
                        socialIdExits = true
                    }
                    ;
                    if ((typeof returnedData.facebookId != 'undefined' && returnedData.facebookId == payloadData.facebookId) || (typeof returnedData.linkedinId != 'undefined' && returnedData.linkedinId == payloadData.linkedinId)) {
                        RunQuery = "update";
                        return cb()
                    } else if (socialIdExits) {
                        RunQuery = "update";
                        return cb()
                    }
                    else {
                        return cb(Responses.EMAIL_ALREADY_EXIST);
                    }
                } else {
                    return cb()
                }
            });
        }],
        createUser: ['getUserData', (r2, Incb)=> {
            console.log("====createuserInit====", RunQuery, returnedData)
            if (RunQuery == "Insert") {
                var dataToSet = payloadData;
                //console.log("dataToSet", dataToSet);
                if (payloadData.isEmailVerify) {
                    dataToSet.isEmailVerified = true;
                }
                if (payloadData.socialMode) {
                    dataToSet.socialMode = payloadData.socialMode
                }
                if (payloadData.password) {
                    var password = Utils.universalfunctions.encryptpassword(payloadData.password);  //UniversalFunctions.CryptData(res + res1);
                    dataToSet.password = password;
                }
                Service.UserService.createUser(dataToSet, (err, data)=> {
                    console.log("===errerrerr===", err)
                    if (err)  return Incb(err);
                    returnedData = data;
                    return Incb();
                });
            } else {
                return Incb();
            }
        }],
        createStripeId: ['createUser', (r3, cb)=> {
            if (RunQuery == "Insert") {
                paymentController.createCustomer(returnedData, (err, result)=> {
                    if (err) return cb(err);
                    return cb(null, result)
                })
            } else {
                return cb()
            }
        }],
        unsetDeviceToken: ['createUser', (r4, cb)=> {
            var data = {
                device_token: payloadData.device_token,
                device_type: payloadData.device_type
            }
            Utils.universalfunctions.unsetDeviceToken(data, (err, result)=> {
                if (err) return cb(err);
                return cb();
            })
        }],
        generateEmailVerifyToken: ['createUser', (r5, cb)=> {
            console.log("generateEmailVerifyToken");
            // verificationToken = Utils.universalfunctions.generateRandomString(10) + returnedData.email + moment().valueOf() + returnedData._id;
            // verificationToken = Utils.universalfunctions.encryptpassword(verificationToken);
            verificationToken = jwt.sign({ //generating email verification token
                    email: returnedData.email
                },
                Configs.CONSTS.jwtkey, {algorithm: Configs.CONSTS.jwtAlgo, expiresIn: '24h'} //setting expiry of 3 days
            );
            return cb();
        }],
        setAccesToken: ['unsetDeviceToken', 'generateEmailVerifyToken', 'createStripeId', (r6, cb)=> {
            console.log("updateUser init")
            var setCriteria = {email: returnedData.email};
            token = jwt.sign({
                    id: returnedData._id,
                    email: returnedData.email,
                    //role: payloadData.userType
                },
                Configs.CONSTS.jwtkey, {
                    algorithm: Configs.CONSTS.jwtAlgo,
                    //expiresIn: '2 days'
                }
            );
            var deviceDetail = {
                device_type: payloadData.device_type,
                device_token: payloadData.device_token,
            }
            var setQuery = {
                updatedAt: new Date(),
                accessToken: token,
                deviceDetail: deviceDetail,
                emailVerificationToken: verificationToken
            };
            console.log("socialIdExits", socialIdExits, "RunQuery", RunQuery);
            if (RunQuery == "update") {
                if (payloadData.facebookId) {
                    setQuery.facebookId = payloadData.facebookId
                }
                if (payloadData.linkedinId) {
                    setQuery.linkedinId = payloadData.linkedinId
                }
                if (returnedData.email != payloadData.email) {
                    setQuery.email = payloadData.email
                }
            }
            ;
            console.log("setQuery", RunQuery, payloadData.facebookId, setQuery);
            Service.UserService.updateUser(setCriteria, setQuery, {}, (err, data)=> {
                if (err) return cb(err)
                returnedData = data;
                return cb(null, data);
            });
        }],
        getUserDataofRegisterUser: ['setAccesToken', (r4, cb)=> {
            var getCriteria = {
                email: payloadData.email,
                userType: payloadData.userType
            };
            Service.UserService.getUser(getCriteria, {password: 0}, {}, function (err, data) { //console.log("data++++",getCriteria,data)
                if (err) return cb({errorMessage: 'DB Error: ' + err})
                if (data && data.length > 0 && data[0].email) {
                    returnedData = data[0];
                    return cb()
                } else {
                    return cb()
                }
            });
        }],
        sendverification: ['getUserDataofRegisterUser', (r1, cb)=> { // send verification email to user

            var templatepath = Path.join(__dirname, '../emailTemplates/');
            var fileReadStream = fs.createReadStream(templatepath + 'welcomeUser.html');

            var emailTemplate = '';
            fileReadStream.on('data', function (buffer) {
                emailTemplate += buffer.toString();
            });
            var path = Configs.CONSTS.baseUrl + '/emailTemplates/confirmAccount.html?emailConfirmToken=' + verificationToken + '&email=' + payloadData.email;
            // var path = 'http://127.0.0.1:8000/emailTemplates/confirmAccount.html?emailConfirmToken=' + verificationToken + '&email=' + params.email;

            var imagePath = Path.join(__dirname, '../emailTemplates/img/logo.png');
            fileReadStream.on('end', function (res) {
                var sendStr = emailTemplate.replace('{{path}}', path).replace('{{imagePath}}', imagePath);

                var email_data = { // set email variables for user
                    to: payloadData.email,
                    from: 'JayDeeApp <' + Configs.CONSTS.noReplyEmail + '>',
                    subject: 'Welcome- JayDeeApp',
                    html: sendStr
                };
                Utils.universalfunctions.send_email(email_data, (err, res)=> {
                    if (err)return cb(err);
                    return cb(null, {
                        "statusCode": 200,
                        "status": "success",
                        "message": "Verification link sent to your email."
                    })
                });
            })
        }]
    }, (err, result)=> {
        if (err) return CallbackRoute(err);
        return CallbackRoute(null, {
            accessToken: returnedData.accessToken,
            userDetails: Utils.universalfunctions.deleteUnnecessaryUserData(returnedData)
        });
    });
}
var login = function (payloadData, userData, CallbackRoute) {
    var returnedData, token, verificationToken, registerSocialId, IsFirstLogin = true;
    var RunQuery = "Insert";
    async.auto({
        verifyEmailAddress: [(cb)=> {
            if (!Utils.universalfunctions.verifyEmailFormat(payloadData.email)) return cb(Responses.INVALID_EMAIL);
            return cb();
        }],
        ValidateForfacebookIdAndPassword: [(cb)=> {
            if (payloadData.facebookId && payloadData.linkedinId) {
                return cb(Responses.FACEBOOK_AND_LINKEDIN_ID);
            } else if (payloadData.facebookId) {
                if (payloadData.password) return cb(Responses.FACEBOOKID_ID_PASSWORD_ERROR);
                if (!payloadData.socialMode) return cb(Responses.SOCIAL_MODE_IS_REQUIRED);
                registerSocialId = true;
                return cb();
            } else if (payloadData.linkedinId) {
                if (payloadData.password) return cb(Responses.FACEBOOKID_ID_PASSWORD_ERROR);
                if (!payloadData.socialMode) return cb(Responses.SOCIAL_MODE_IS_REQUIRED);
                registerSocialId = true;
                return cb();
            } else if (!payloadData.password) {
                return cb(Responses.PASSWORD_IS_REQUIRED);
            } else if (payloadData.password) {
                if (payloadData.socialMode) {
                    return cb(Responses.SOCIAL_MODE_PASSWORD_ERROR);
                } else {
                    return cb();
                }
            } else {
                return cb();
            }
        }],
        checkSocialMode: [(cb)=> {
            if (payloadData.linkedinId && payloadData.socialMode != SOCIAL_MODE.LINKEDIN) {
                return cb(Responses.INCORRECT_SOCIAL_MODE);
            } else if (payloadData.facebookId && payloadData.socialMode != SOCIAL_MODE.FACEBOOK) {
                return cb(Responses.INCORRECT_SOCIAL_MODE);
            } else {
                return cb();
            }
        }],
        getUserData: ['verifyEmailAddress', 'ValidateForfacebookIdAndPassword', 'checkSocialMode', (r1, cb)=> { //console.log("getUserData init", RunQuery)
            var conditionArray = [];
            /*if (payloadData.email) {
             conditionArray.push({email: payloadData.email})
             }

             if (payloadData.facebookId) {
             conditionArray.push({facebookId: payloadData.facebookId})
             }

             if (payloadData.email) {
             conditionArray.push({linkedinId: payloadData.linkedinId})
             }
             var Criteria = {
             $or: conditionArray
             };
             */
            var conditionArrayNew = {};
            if (payloadData.password && payloadData.email) {
                //conditionArrayNew.email = payloadData.email;
                var conditionArrayNew = {email: payloadData.email};
            }

            if (payloadData.facebookId) {
                //conditionArrayNew.facebookId = payloadData.facebookId;
                var conditionArrayNew = {facebookId: payloadData.facebookId};
            }

            if (payloadData.linkedinId) {
                //conditionArrayNew.linkedinId = payloadData.linkedinId;
                var conditionArrayNew = {linkedinId: payloadData.linkedinId};
            }
            var Criteria = conditionArrayNew
            console.log("Criteria", Criteria);
            Service.UserService.getUser(Criteria, {}, {}, (err, data)=> { //console.log("getUserData",err, data)
                if (err) return cb(err);
                returnedData = data[0];
                if (data && data.length > 0 && data[0].email) {

                    console.log("IsFirstLogin", !data[0].IsFirstLogin, IsFirstLogin)
                    if (!data[0].IsFirstLogin) {
                        IsFirstLogin = false;
                    }
                    if (!data[0].isEmailVerified) return cb(Responses.EMAIL_IS_NOT_VERIFY);
                    if (payloadData.password) {
                        var password = Utils.universalfunctions.encryptpassword(payloadData.password);
                        if (password != returnedData.password) return cb(Responses.INVALID_EMAIL_PASSWORD);
                        return cb();
                    }
                    return cb();
                } else {
                    return cb(Responses.USER_NOT_FOUND)
                }
            });
        }],
        unsetDeviceToken: ['getUserData', (r2, cb)=> {
            var data = {
                device_token: payloadData.device_token,
                device_type: payloadData.device_type
            }
            Utils.universalfunctions.unsetDeviceToken(data, (err, result)=> {
                if (err) return cb(err);
                return cb();
            })
        }],
        setAccesToken: ['unsetDeviceToken', (r3, cb)=> {
            console.log("setAccesToken init")
            var setCriteria = {_id: returnedData._id};
            token = jwt.sign({
                id: returnedData._id,
                email: returnedData.email
            }, Configs.CONSTS.jwtkey, {algorithm: Configs.CONSTS.jwtAlgo, expiresIn: '2 days'});
            console.log("token", token);
            var deviceDetail = {
                device_type: payloadData.device_type,
                device_token: payloadData.device_token,
            }
            var setQuery = {
                updatedAt: new Date(),
                IsFirstLogin: false,
                accessToken: token,
                deviceDetail: deviceDetail,
            };
            Service.UserService.updateUser(setCriteria, setQuery, {new: true}, (err, data)=> { //console.log("err, data",err, data);
                if (err) return cb(err)
                returnedData = data;
                returnedData.IsFirstLogin = IsFirstLogin
                return cb(null, data);
            });
        }],
        populateUserData: ['setAccesToken', (r3, cb)=> {
            var criteria = {
                _id: returnedData._id
            }
            var projection = {
                password: 0,
                __v: 0,
                emailVerificationToken: 0,
                isBankDetailsFilled: 0,
                isActive: 0,
                isAdminVerifyAccount: 0,
                isDeleted: 0,
                isSuspended: 0,
                isPhoneVerified: 0,
            }
            var populateModel = [
                {
                    path: "category",
                    match: {},
                    select: 'name',
                    model: 'categories',
                    options: {lean: true}
                }
            ]
            var options = {lean: true}
            DBCommonFunction.getDataPopulateOneLevel(Models.users, criteria, projection, options, populateModel, (err, data) => {
                if (err)return cb(err);
                if (data.length == 0) return cb(Responses.INVALID_USER_ID);
                data = Utils.universalfunctions.jsonParseStringify(data);
                returnedData = data[0];
                returnedData.IsFirstLogin = IsFirstLogin;
                return cb(null, data[0])
            })
        }]
    }, (err, result)=> {
        if (err) return CallbackRoute(err);
        return CallbackRoute(null, {
            accessToken: returnedData.accessToken,
            userDetails: Utils.universalfunctions.deleteUnnecessaryUserData(returnedData)
        });
    });
}

var ChangedPassword = function (payloadData, UserData, callbackRoute) {
    var tokenToSend = null;
    var responseToSend = {};
    var tokenData = null;
    var userDBData;
    var token;
    async.auto({
        CheckOldPassword: [(cb)=> {//Check Old Password
            if (UserData.password != Utils.universalfunctions.encryptpassword(payloadData.oldPassword)) return cb(Responses.INCORRECT_OLD_PASS)
            if (UserData.password == Utils.universalfunctions.encryptpassword(payloadData.newPassword)) return cb(Responses.SAME_PASSWORD)
            return cb();
        }],
        UpdatePassword: ['CheckOldPassword', (r1, cb)=> {
            var criteria = {_id: UserData._id};
            var setQuery = {
                password: Utils.universalfunctions.encryptpassword(payloadData.newPassword)
            };
            var options = {lean: true};
            Service.UserService.updateUser(criteria, setQuery, options, function (err, result) {
                if (err) return cb(err);
                return cb();
            });
        }]
    }, (err, result)=> {
        if (err) return callbackRoute(err);
        return callbackRoute();
    });
};

var forgotPassword = function (params, callback) {
    var name;
    var token;
    async.series([
        function (cb) {
            if (!Utils.universalfunctions.verifyEmailFormat(params.email)) return cb(Responses.INVALID_EMAIL);
            return cb();
        },
        function (cb) { //console.log("int420");//check email exist?
            Models.users.find({email: params.email}, {}, {}, function (err, res) { //console.log("erint420r",params.email,err,res);
                if (err) return cb(err);
                if (res.length == 0)return cb(Responses.emailNotExists);
                if (res[0].linkedinId || res[0].facebookId || res[0].socialMode) return cb(Responses.YOU_ARE_REGISTERED_USING_SOCIAL_MEDIA)
                return cb();
            })
        },
        function (cb) {
            console.log("int457");//forgotPasswordToken generate
            token = jwt.sign({ //generating forgot password token
                    email: params.email
                },
                Configs.CONSTS.jwtkey, {algorithm: Configs.CONSTS.jwtAlgo, expiresIn: '24h'} //setting expiry of 24hours
            );
            var objToUpdate = {
                forgetpasswordVerifyToken: token
            };
            Models.users.findOneAndUpdate({email: params.email}, objToUpdate, {new: true}, function (err, res) { //console.log("err",err,res);//set reset password token in db
                if (err || res == null)
                    cb(err ? Responses.systemError : Responses.emailNotExists);
                else {
                    name = res.name
                    cb()
                }
            })
        },
        function (cb) {
            var templatepath = Path.join(__dirname, '../emailTemplates/');
            var fileReadStream = fs.createReadStream(templatepath + 'forgotPassword.html');
            var emailTemplate = '';
            fileReadStream.on('data', function (buffer) {
                emailTemplate += buffer.toString();
            });
            // var path = 'http://127.0.0.1:8002/emailTemplates/resetPassword.html?passwordResetToken=' + token + '&email=' + params.email;
            var path = Configs.CONSTS.baseUrl + '/emailTemplates/resetPassword.html?passwordResetToken=' + token + '&email=' + params.email;
            fileReadStream.on('end', function (res) {
                var sendStr = emailTemplate.replace('{{name}}', name).replace('{{path}}', path);

                var email_data = { // set email variables for user
                    to: params.email,
                    from: 'JayDee App<' + Configs.CONSTS.noReplyEmail + '>',
                    subject: 'Reset password request- JayDee App',
                    html: sendStr
                };

                Utils.universalfunctions.send_email(email_data, function (err, res) {
                    if (err)return cb(Responses.systemError);
                    return cb();
                });
            })
        }
    ], function (err, result) {
        if (err) return callback(err)
        return callback()
    });

}
var resetForgotPassword = function (params, callback) {
    var passwordhash;
    var confirm_passwordhash;
    async.series([
            function (cb) {
                Utils.universalfunctions.check_resetpassword_token_exist(params.forgotPasswordToken, function (err, res) { // check if token exist?
                    if (res.length > 0)
                        cb();
                    else
                        cb(Responses.tokenNotExist)

                })
            },
            function (cb) {
                console.log("init===2");
                passwordhash = Utils.universalfunctions.encryptpassword(params.password); //hashing password
                confirm_passwordhash = Utils.universalfunctions.encryptpassword(params.confirm_password); //hashing password
                jwt.verify(params.forgotPasswordToken, Configs.CONSTS.jwtkey, function (err, decode) { // checking token expiry
                    if (err) {
                        cb(Responses.tokenExpired)
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                console.log("init===3");
                if (passwordhash == confirm_passwordhash) {
                    var criteria = {
                        forgetpasswordVerifyToken: params.forgotPasswordToken
                    };
                    var objToUpdate = {
                        $unset: {forgetpasswordVerifyToken: 1},
                        password: passwordhash
                    };
                    Models.users.findOneAndUpdate(criteria, objToUpdate, {}, function (err, res) {
                        console.log("err, res", criteria, err, res);
                        if (err) return cb(err);
                        if (res == null) cb(Utils.responses.tokenNotExist);
                        else
                            cb({
                                "statusCode": 200,
                                "status": "success",
                                "message": "Password updated successfully."
                            })
                    })
                }
                else {
                    cb(Responses.ConfirmPasswordNotmatch)
                }
            }
        ],
        function (err, result) {
            if (err)
                callback(err)
            else
                callback(null, result)

        })
}

var verifyForgotPasswordToken = function (params, callback) {
    async.series([
            function (cb) {
                Models.users.findOne({$and: [{forgetpasswordVerifyToken: params.forgotPasswordToken}, {email: params.email}]}, function (err, res) {
                    if (err || res == null)
                        cb(err ? Responses.systemError : Responses.tokenNotExist);
                    else
                        cb()
                })
            },
            function (cb) {
                jwt.verify(params.forgotPasswordToken, Configs.CONSTS.jwtkey, function (err, decode) { // checking token expiry
                    if (err)
                        cb(Responses.forgotPasswordLinkExpired);
                    else
                        cb(null, null);
                });
            }
        ],
        function (err, result) {
            if (err)
                callback(err)
            else
                callback(null, result)

        })
}
var Logout = function (payloadData, UserData, callbackRoute) {
    var tokenToSend = null;
    var responseToSend = {};
    var tokenData = null;
    var userDBData;
    var token;
    var criteria = {_id: UserData._id};
    var setQuery = {
        $unset: {
            accessToken: 1,
            deviceDetail: 1
        }

    };
    Service.UserService.updateUser(criteria, setQuery, {}, function (err, result) {
        if (err) return callbackRoute(err);
        return callbackRoute();
    });
};

var resentEmailVerificationLink = function (params, callback) {
    var verificationToken
    async.series([
        function (cb) {
            if (!Utils.universalfunctions.verifyEmailFormat(params.email)) return cb(Responses.INVALID_EMAIL);
            return cb();
        },
        function (cb) {
            Models.users.find({email: params.email}, {}, {}, function (err, res) {
                if (err || res.length == 0)
                    cb(err ? Responses.systemError : Responses.emailNotExists)
                else
                    cb()
            })
        },
        function (cb) {//generating and updating email token in db
            console.log("generateEmailVerifyToken");
            // verificationToken = Utils.universalfunctions.generateRandomString(10) + params.email + moment().valueOf();
            // verificationToken = Utils.universalfunctions.encryptpassword(verificationToken);

            verificationToken = jwt.sign({ //generating email verification token
                    email: params.email
                },
                Configs.CONSTS.jwtkey, {algorithm: Configs.CONSTS.jwtAlgo, expiresIn: '24h'} //setting expiry of 3 days
            );
            var criteria = {
                email: params.email
            };
            var setData = {
                emailVerificationToken: verificationToken
            };
            Service.UserService.updateUser(criteria, setData, {}, (err, data)=> {
                if (err)
                    cb(err)
                else
                    cb();
            });
        },
        function (cb) { // send verification email to user

            var templatepath = Path.join(__dirname, '../emailTemplates/');
            var fileReadStream = fs.createReadStream(templatepath + 'welcomeUser.html');
            var emailTemplate = '';
            fileReadStream.on('data', function (buffer) {
                emailTemplate += buffer.toString();
            });
            var path = Configs.CONSTS.baseUrl + '/emailTemplates/confirmAccount.html?emailConfirmToken=' + verificationToken + '&email=' + params.email;
            // var path = 'http://127.0.0.1:8000/emailTemplates/confirmAccount.html?emailConfirmToken=' + verificationToken + '&email=' + params.email;

            fileReadStream.on('end', function (res) {
                var sendStr = emailTemplate.replace('{{path}}', path);

                var email_data = { // set email variables for user
                    to: params.email,
                    from: 'JayDeeApp <' + Configs.CONSTS.noReplyEmail + '>',
                    subject: 'Welcome- JayDeeApp',
                    html: sendStr
                };

                Utils.universalfunctions.send_email(email_data, function (err, res) {
                    if (err) {
                        cb(err);
                    } else {
                        cb({
                            "statusCode": 200,
                            "status": "success",
                            "message": "Verification link sent to your email."
                        })
                    }
                });
            })
        }
    ], function (err, result) {
        if (err)
            callback(err)
        else
            callback(null, result)

    })
}

var verifyEmailToken = function (params, callback) {
    async.series([
            function (cb) {
                Models.users.findOne({$and: [{emailVerificationToken: params.emailVerificationToken}, {email: params.email}]}, function (err, res) {
                    if (err || res == null)
                        cb(err ? Responses.systemError : Responses.tokenNotExist);
                    else
                        cb();
                })
            },
            function (cb) {
                Models.users.findOneAndUpdate({email: params.email}, {
                    $unset: {
                        emailVerificationToken: 1
                    },
                    isEmailVerified: true
                }, {new: true}, function (err, res) {
                    if (err || res == null)
                        cb(err ? Responses.systemError : Responses.tokenNotExist);
                    else
                        cb({
                            "statusCode": 200,
                            "status": "success",
                            "message": "Token verified successfully."
                        });
                })
            },
        ],
        function (err, result) {
            if (err)
                callback(err)
            else
                callback(null, result)

        })
}
var getAllUsers = function (params, callback) {
    Models.users.find({}, {}, {}, function (err, res) {
        if (err)
            callback(Responses.systemError)
        else
            callback({
                "statusCode": 200,
                "status": "success",
                "message": "Data fetch successfully.",
                "result": res
            })
    })
}
var editConsumerProfile = function (payloadData, UserData, callback) {
    var location, returnedDatas;
    payloadData.attachments = payloadData.profile_pic;
    async.series([
        function (cb) {
            //if (UserData.email != payloadData.email) {
            Models.users.find({email: payloadData.email}, {}, {}, function (err, res) {
                if (err || res.length > 0) {
                    cb(err ? Responses.systemError : Responses.emailAlreadyExists)
                }
                else
                    cb()
            })
        },
        function (cb) {//email validation check
            if (payloadData.email) {
                if (!Utils.universalfunctions.verifyEmailFormat(payloadData.email)) return cb(Responses.INVALID_EMAIL);
                return cb();
            } else {
                return cb()
            }
        },
        function (cb) {
            if (payloadData.attachments) {
                console.log("dasdas");
                if (Array.isArray(payloadData.attachments) == false) {
                    if (payloadData.attachments['_data'].length > 1048576 * 5) {
                        return cb(Responses.fileLengthExceeded);
                    }
                }
                else {
                    for (var i = 0; i < payloadData.attachments.length; i++) {
                        if (payloadData.attachments[i]['_data'].length > 1048576 * 5) {// file size sholud not exceed 5MB
                            return cb(Responses.fileLengthExceeded);
                        }
                    }
                }
            }
            cb()
        },
        function (cb) {
            if (payloadData.attachments) {
                var picData = {
                    file: payloadData.attachments,
                    user_id: UserData._id,
                    type: 1
                };
                if (payloadData.attachments.length >= 0) {
                    Utils.universalfunctions.uploadMultipleDocuments(picData, function (err, res) {
                        if (err) {
                            cb(err)
                        } else {
                            imageUrl = res;
                            cb();
                        }
                    });
                } else {
                    picData.profile_pic = picData.file
                    Utils.universalfunctions.uploadDocument(picData, function (err, res) {
                        if (err) {
                            cb(err)
                        } else {
                            imageUrl = res;
                            cb();
                        }
                    });
                }
            } else {
                cb()
            }
        },
        function (cb) {
            location = {type: "Point", coordinates: [payloadData.longitude, payloadData.lattitude]}
            var objToUpdate = {
                //email: payloadData.email,
                phone: payloadData.phone,
                location: location,
            };
            if (payloadData.location_name) {
                objToUpdate.location_name = payloadData.location_name
            }
            if (payloadData.email) {
                objToUpdate.email = payloadData.email;
            }

            if (payloadData.about_yourself) {
                objToUpdate.about_yourself = payloadData.about_yourself;
            }

            if (payloadData.name) {
                objToUpdate.name = payloadData.name;
            }

            if (payloadData.attachments) {
                objToUpdate.profile_pic = imageUrl
            }
            var criteria = {
                _id: UserData._id
            }; //console.log("objToUpdate",objToUpdate);
            Models.users.findOneAndUpdate(criteria, objToUpdate, {new: true, lean: true}, function (err, res) {
                if (err) return cb(err)
                if (res == null) return cb(Responses.idNotExist)
                return cb()
            })
        },
        function (cb) {
            var criteria = {
                _id: UserData._id
            };

            var projection = {
                password: 0,
                __v: 0,
                emailVerificationToken: 0,
                isBankDetailsFilled: 0,
                isActive: 0,
                isAdminVerifyAccount: 0,
                isDeleted: 0,
                isSuspended: 0,
                isEmailVerified: 0,
                isPhoneVerified: 0,
            }
            var populateModel = [
                {
                    path: "category",
                    match: {},
                    select: 'name',
                    model: 'categories',
                    options: {lean: true}
                }
            ]
            var options = {lean: true}
            DBCommonFunction.getDataPopulateOneLevel(Models.users, criteria, projection, options, populateModel, (err, data) => {
                if (err)return cb(err);
                if (data.length == 0) return cb(Responses.INVALID_USER_ID);
                data = Utils.universalfunctions.jsonParseStringify(data);
                delete data[0].accessToken;
                returnedData = {
                    "statusCode": 200,
                    "status": "success",
                    "message": "Profile updated successfully.",
                    result: data[0]
                };
                return cb()
            })
        }
    ], function (err, result) {
        if (err) return callback(err)
        return callback(null, returnedData)
    })
}

var Logout = function (payloadData, UserData, callbackRoute) {
    var tokenToSend = null;
    var responseToSend = {};
    var tokenData = null;
    var userDBData;
    var token;
    var criteria = {_id: UserData._id};
    var setQuery = {
        $unset: {
            accessToken: 1
        }

    };
    Service.UserService.updateUser(criteria, setQuery, {}, function (err, result) {
        if (err) return callbackRoute(err);
        return callbackRoute();
    });
};

var getUserDataApi = function (payloadData, callback) {
    var returnData;
    async.series([
        (cb)=> {
            var criteria = {
                _id: payloadData._id
            }
            var projection = {
                password: 0,
                __v: 0,
                emailVerificationToken: 0,
                isBankDetailsFilled: 0,
                accessToken: 0,
                isActive: 0,
                isAdminVerifyAccount: 0,
                isDeleted: 0,
                isSuspended: 0,
                isEmailVerified: 0,
                isPhoneVerified: 0,
            }
            var populateModel = [
                {
                    path: "category",
                    match: {},
                    select: 'name',
                    model: 'categories',
                    options: {lean: true}
                }
            ]
            var options = {lean: true}
            DBCommonFunction.getDataPopulateOneLevel(Models.users, criteria, projection, options, populateModel, (err, data) => {
                //Service.UserService.getUser(criteria,projection, {lean:true}, function (err, res) {
                if (err)return cb(err);
                if (data.length == 0) return cb(Responses.INVALID_USER_ID);
                data = Utils.universalfunctions.jsonParseStringify(data);
                returnData = data[0];
                return cb(null, data[0])
            })
        }
    ], (err, res)=> { //console.log("res",res);
        if (err) return callback(err)
        return callback(null, returnData)
    })
}

var verifyLicense = function (payloadData, callback) {
    async.series([
        function (cb) {
            var criteria = {
                _id: payloadData.trademenId,
                user_type: USER_TYPE.TRADEMEN
            }
            var objToUpdate = {
                isAdminVerifyAccount: true
            }
            Models.users.findOneAndUpdate(criteria, objToUpdate, {}, function (err, res) {
                if (err || res == null) {
                    cb(err ? Responses.systemError : Responses.INVALID_USER_ID)
                }
                else {
                    cb(null, res)
                }

            })
        }
    ], function (err, result) {
        if (err) {
            callback(err)
        }
        else
            callback(null, result)
    })
}
var contactUs = function (params, UserData, callback) {
    async.series([
            function (cb) {
                Models.users.findOne({_id: UserData._id}, function (err, res) {
                    if (err || res == null)
                        cb(err ? Responses.systemError : Responses.tokenNotExist);
                    else {
                        if (params.email.toString() != UserData.email.toString()) {
                            cb({
                                statusCode: 400,
                                status: 'error',
                                message: 'Please use your own email address.',
                                responseType: "INVALID_EMAIL"
                            })
                        }
                        else {
                            cb()
                        }

                    }
                })
            },
            function (cb) {
                var templatepath = Path.join(__dirname, '../emailTemplates/');
                var fileReadStream = fs.createReadStream(templatepath + 'contactUs.html');

                var emailTemplate = '';
                fileReadStream.on('data', function (buffer) {
                    emailTemplate += buffer.toString();
                });

                var imagePath = Path.join(__dirname, '../emailTemplates/img/logo.png');
                fileReadStream.on('end', function (res) {
                    var sendStr = emailTemplate.replace('{{name}}', UserData.name)

                    var email_data = { // set email variables for user
                        to: UserData.email,
                        from: 'JayDeeApp <' + Configs.CONSTS.noReplyEmail + '>',
                        subject: 'JayDeeApp Query Reported Successfully',
                        html: sendStr
                    };
                    Utils.universalfunctions.send_email(email_data, (err, res)=> {
                        if (err)return cb(err);
                        return cb(null, {
                            "statusCode": 200,
                            "status": "success",
                            "message": "Reported successfully."
                        })
                    });
                })
            },
            function (cb) {
                var templatepath = Path.join(__dirname, '../emailTemplates/');
                var fileReadStream = fs.createReadStream(templatepath + 'contactUs_admin.html');

                var emailTemplate = '';
                fileReadStream.on('data', function (buffer) {
                    emailTemplate += buffer.toString();
                });

                var imagePath = Path.join(__dirname, '../emailTemplates/img/logo.png');
                fileReadStream.on('end', function (res) {
                    var sendStr = emailTemplate.replace('{{name}}', UserData.name).replace('{{email}}', UserData.email).replace('{{description}}', params.description)

                    var email_data = { // set email variables for user
                        to: 'tradePeopleAdmin12@yopmail.com',
                        from: 'JayDeeApp <' + Configs.CONSTS.noReplyEmail + '>',
                        subject: 'JayDeeApp A Query Reported',
                        html: sendStr
                    };
                    Utils.universalfunctions.send_email(email_data, (err, res)=> {
                        if (err)return cb(err);
                        return cb(null, {
                            "statusCode": 200,
                            "status": "success",
                            "message": "Reported successfully."
                        })
                    });
                })

            }
        ],
        function (err, result) {
            if (err)
                callback(err)
            else
                callback(null, result)

        })
}
var notification = function (payloadData, UserData, CallbackRoute) {
    var returnData, TotalCount = 0;
    var populateModel = [
        {
            path: "sender_id",
            match: {},
            select: 'name email phone profile_pic',
            model: 'user',
            options: {lean: true}
        },
        {
            path: "receiver_id",
            match: {},
            select: 'name email phone profile_pic',
            model: 'user',
            options: {lean: true}
        }, {
            path: "subJob_id",
            match: {},
            select: 'jobId',
            model: 'subjob',
            options: {lean: true}
        }
    ];
    var nestedModel = {
        path: "subJob_id.jobId",
        match: {},
        select: 'jobTitle',
        model: 'job',
        options: {lean: true}
    }
    var criteria1 = {receiver_id: UserData._id};
    var project = {__v: 0, transactions: 0};
    async.auto({
        getNotification: [(cb)=> {

            var options = {
                skip: payloadData.skip,
                limit: payloadData.limit,
                //sort: {createdAt: -1}
            }
            DBCommonFunction.getDataDeepPopulateFixed(Models.notifications, criteria1, project, options, populateModel, nestedModel,(err, data) => {
                console.log("asdasdasd", err);
                if (err) return cb(err);
                returnData = Utils.universalfunctions.jsonParseStringify(data)
                return cb();
            })
        }],
        TotalNotification: [(cb)=> {
            var options = {}
            DBCommonFunction.getDataPopulateOneLevel(Models.notifications, criteria1, project, options, populateModel, (err, data) => {
                if (err) return cb(err);
                TotalCount = data.length;
                return cb();
            })
        }]
    }, (err, result) => {
        if (err) return CallbackRoute(err)
        return CallbackRoute(null, {
            TotalCount: TotalCount,
            notificationData: returnData//result.getCurrentJob
        });
    })
}

var testPushNotifications = function (payloadData, callback) {
    var Data = {
        message:payloadData.message,
        jobid:payloadData.message,
        device_token:payloadData.device_token

    }
    Utils.universalfunctions.sendNotification(Data,(err,result)=>{
        callback(null, null)
    })

}

var toggleNotification = function (payloadData, UserData, CallbackRoute) {
    Models.users.findOneAndUpdate({_id: UserData._id}, {isNotifications: payloadData.is_notification}, {new: true}, function (err, res) {
        if (err || res == null) {
            CallbackRoute(err ? Utils.responses.systemError : Utils.responses.invalidCredentials);
        } else {
            CallbackRoute(null, res.isNotifications);
        }
    })
}
module.exports = {
    registerUser: registerUser,
    login: login,
    Logout: Logout,
    ChangedPassword: ChangedPassword,
    forgotPassword: forgotPassword,
    resetForgotPassword: resetForgotPassword,
    verifyForgotPasswordToken: verifyForgotPasswordToken,
    resentEmailVerificationLink: resentEmailVerificationLink,
    verifyEmailToken: verifyEmailToken,
    getAllUsers: getAllUsers,
    editConsumerProfile: editConsumerProfile,
    getUserDataApi: getUserDataApi,
    verifyLicense: verifyLicense,
    contactUs: contactUs,
    notification: notification,
    testPushNotifications: testPushNotifications,
    toggleNotification: toggleNotification
}