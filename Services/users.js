/*-----------------------------------------------------------------------
 * @ file        : users.js
 * @ description : This is the user service which will handle the user CRUD.
 * @ author      : Duddukuri Mahesh
 * @ date        :
 -----------------------------------------------------------------------*/

/*--------------------------------------------
 * Include internal and external modules.
 ---------------------------------------------*/

const Boom = require('boom');
const async = require('async');
const jwt = require('jsonwebtoken');
const path = require('path')
const fs = require('fs');
const _ = require('underscore');

const Models = require('../Models');
const Utils = require('../Utils');
const Configs = require('../Configs');
const env = require('../env');
const email_credentials = Configs.SMTP[env.instance];
const logger = Utils.logger;

module.exports = {

    // register new user.
    register: (params, callback) => {
        async.waterfall([
            function (cb) {
                Utils.universalfunctions.check_contact_exist(params.phone, function (err, res) {
                    if (err) {
                        cb(err)
                    } else if (res && res.length > 0) {
                        cb(Utils.responses.contactAlreadyExists);
                    } else {
                        cb(null, params)
                    }
                });
            },
            function (data, cb) {
                var phone_verification_token = Utils.universalfunctions.generateRandomString(4);

                var new_user = {
                    name: data.full_name,
                    phone: data.phone,
                    password: Utils.universalfunctions.encryptpassword(data.password),
                    phone_verification_token: phone_verification_token,
                    role: data.role,
                    active_role: data.role,
                    device_token: {
                        device_token: (params.device_token) ? params.device_token : 'store_device_token',
                        device_type: (params.device_type) ? params.device_type : 1
                    }
                };

                Models.users(new_user).save(function (err, res) {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null, res)
                    }
                })
            },
            function (data, cb) {

                var tokenObj = {
                        phone: data.phone,
                        is_confirmed: data.is_confirmed,
                        email: data.email,
                        email_is_verified: data.email_is_verified,
                        phone_is_verified: data.phone_is_verified,
                        name: data.name,
                        forgetPassword: data.forgetPassword,
                        role: data.role,
                        user_image: data.user_image,
                        _id: data._id
                    },

                    login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                        algorithm: Configs.CONSTS.jwtAlgo,
                        expiresIn: '2 days'
                    }),

                    queryObj = {
                        _id: data._id
                    },
                    updateObj = {
                        login_token: login_token
                    },
                    options = {
                        upsert: false,
                        new: true
                    };

                Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
                    if (res) {
                        res.user_data = tokenObj;
                        cb(null, res);
                    } else {
                        cb(err || Utils.responses.systemError)
                    }
                });

            },
            function (data, cb) {
                var requestObject = {
                    message: 'Your generated OTP for Pwayz registration is ' + data.phone_verification_token,
                    phone: data.phone
                }

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    if (err) {
                        logger.errorLogger("Error while sending verification message to registered user", err)
                    } else {
                        logger.successLogger("Successfully sent verification message to registered user", res)
                    }
                });

                var response = Utils.responses.registerSuccessfully;

                response.result = data.user_data;

                response.result["otp"] = data.phone_verification_token;

                result = {
                    response: response,
                    login_token: data.login_token
                }

                cb(null, result);

            }
        ], callback);
    },
    // user login.
    login: (params, callback) => {
        var isParkingSpaceAdded = false, ParkingId, datanew;
        async.waterfall([
            function (cb) {

                var queryObj = {
                    phone: params.phone,
                    password: Utils.universalfunctions.encryptpassword(params.password),
                    is_deleted: false
                };

                Models.users.findOne(queryObj).exec(function (err, res) {
                    if (res) {
                        if (res.is_suspended) {
                            cb(Utils.responses.suspended)
                        } else {

                            var tokenObj = {
                                phone: res.phone,
                                is_confirmed: res.is_confirmed,
                                email: res.email,
                                email_is_verified: res.email_is_verified,
                                phone_is_verified: res.phone_is_verified,
                                name: res.name,
                                forgetPassword: res.forgetPassword,
                                role: res.role,
                                user_image: res.user_image
                            };

                            if (res.space_owner_custom_account) {
                                var accountDetails = JSON.parse(res.space_owner_custom_account_details),
                                    external_accounts = accountDetails.external_accounts.data[0];

                                tokenObj.customAccount = {
                                    first_name: accountDetails.legal_entity.first_name,
                                    last_name: accountDetails.legal_entity.last_name,
                                    dob: accountDetails.legal_entity.dob,
                                    sort: external_accounts.routing_number,
                                    account_last__4: external_accounts.last4,
                                    address: accountDetails.legal_entity.address.line1,
                                    state: accountDetails.legal_entity.address.state,
                                    city: accountDetails.legal_entity.address.city,
                                    postal_code: accountDetails.legal_entity.address.postal_code,
                                    verification_doc: accountDetails.legal_entity.verification.document,
                                    is_verified: (res.space_owner_custom_account_status == 1),
                                    is_rejected: (res.space_owner_custom_account_status == 3)
                                };

                            }

                            var login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                                algorithm: Configs.CONSTS.jwtAlgo,
                                expiresIn: '2 days'
                            });

                            datanew = {
                                user_id: res._id,
                                login_token: login_token,
                                user_data: tokenObj
                            };

                            cb(null, datanew)
                        }
                    } else {
                        cb(err || Utils.responses.invalidCredentials)
                    }
                });
            },
            function (data, cb) {
                var queryObj = {
                    User_ID: data.user_id,
                };

                Models.parking.find(queryObj, {}, {sort: {_id: -1}}).exec(function (err, res) {
                    if (res.length > 0) {
                        ParkingId = res[0]._id;
                        isParkingSpaceAdded = true;
                    }
                    ;
                    res.forEach(function (element) {
                        if (!element.is_deleted) {
                            ParkingId = element._id
                        }
                    })
                    //console.log("datanew",datanew);
                    cb(null, datanew);
                });
            },
            function (data, cb) {

                var queryObj = {
                        _id: data.user_id
                    },
                    updateObj = {

                        login_token: data.login_token,
                        forget_verify_token: "",
                        forgetPassword: false,
                        is_active: true,
                        "device_token.device_token": (params.device_token) ? params.device_token : 'store_device_token',
                        "device_token.device_type": (params.device_type) ? params.device_type : 1
                    },
                    options = {
                        upsert: false,
                        new: true
                    };

                Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
                    console.log('----------- err,res -----------', err, res);

                    if (res) {
                        data.user_data._id = res._id;
                        data.user_data.isParkingSpaceAdded = isParkingSpaceAdded;
                        data.user_data.ParkingId = ParkingId;
                        var response = {
                            isParkingSpaceAdded: isParkingSpaceAdded,
                            login_token: res.login_token,
                            user_data: data.user_data
                        };//console.log("========xxxxxxxhere========",response);
                        cb(null, response);
                    } else
                        cb(err || Utils.responses.systemError)
                });
            }
        ], callback);
    },
    // forget password.
    forgetPassword: (params, callback) => {

        if (params.type == 1) {          // for phone number entry.

            async.waterfall([

                function (cb) {         // check user phone number exist or not.

                    Utils.universalfunctions.check_contact_exist(params.phone, function (err, res) {
                        console.log('----err,res is -----------', err, res);
                        if (err) {
                            cb(err)
                        } else if (res && res.length > 0) {

                            if ((res[0].is_suspended))
                                cb(Utils.responses.suspended);
                            else
                                cb(null, params)
                        } else {
                            cb(Utils.responses.phoneNumberNotExists);
                        }
                    });
                },
                function (data, cb) {    // update the user password in DB.

                    var token = Utils.universalfunctions.generateRandomString(4);

                    Models.users.findOneAndUpdate({phone: params.phone}, {
                        forget_verify_token: token,
                        forgetPassword: true
                    }, {new: true}).exec(function (err, res) {
                        console.log('----@@@-------- generated forget password code is ---------@@----', token);
                        if (res)
                            cb(null, res);
                        else
                            cb(err || Utils.responses.systemError);
                    });
                },
                function (data, cb) {

                    var tokenObj = {
                            phone: data.phone,
                            active_role: data.active_role,
                            is_confirmed: data.is_confirmed,
                            email: data.email,
                            email_is_verified: data.email_is_verified,
                            phone_is_verified: data.phone_is_verified,
                            forgetPassword: true,
                            name: data.name,
                            role: data.role,
                            user_image: data.user_image
                        },

                        login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                            algorithm: Configs.CONSTS.jwtAlgo,
                            expiresIn: '2 days'
                        });

                    Models.users.findOneAndUpdate({phone: params.phone}, {login_token: login_token}, {new: true}).exec(function (err, res) {
                        if (res)
                            cb(null, res)
                        else
                            cb(err || Utils.responses.systemError);
                    });
                },
                function (data, cb) {    // send OTP SMS.

                    var requestObject = {
                        message: 'Your generated OTP for reset password is ' + data.forget_verify_token,
                        phone: data.phone
                    };

                    Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                        if (err)
                            console.log('------- error at SMS send forget password reset token --------', err);
                        else
                            console.log('------- Response at SMS send forget password reset token --------', res);
                    });
                    var data = {
                        login_token: data.login_token,
                        resObj: Utils.responses.forgetPasswordPhone
                    };
                    cb(null, data);

                }

            ], callback);
        } else {                        // for email entry.

            async.waterfall([

                function (cb) {         // check user email exist or not.

                    Models.users.findOne({email: params.email}, function (err, res) {
                        console.log('-----err,res of this is --------', err, res);
                        if (res) {
                            if (res.is_suspended)
                                cb(Utils.responses.suspended);
                            else
                                cb(null, params);
                        } else {
                            callback(Utils.responses.emailnotExistForRole, null);
                        }
                    });
                },
                function (data, cb) {    // update the user password in DB.
                    console.log('-------data is  ------', data);
                    var token = Utils.universalfunctions.generateRandomString(4);

                    Models.users.findOneAndUpdate({email: params.email}, {
                        forget_verify_token: token,
                        forgetPassword: true
                    }, {new: true}).exec(function (err, res) {
                        if (res)
                            cb(null, res);
                        else
                            cb(Utils.responses.systemError, null);
                    });
                },
                function (data, cb) {

                    var tokenObj = {
                            phone: data.phone,
                            is_confirmed: data.is_confirmed,
                            email: data.email,
                            email_is_verified: data.email_is_verified,
                            phone_is_verified: data.phone_is_verified,
                            forgetPassword: true,
                            name: data.name,
                            role: data.role,
                            user_image: data.user_image
                        },

                        login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                            algorithm: Configs.CONSTS.jwtAlgo,
                            expiresIn: '2 days'
                        });

                    Models.users.findOneAndUpdate({email: params.email}, {login_token: login_token}, {new: true}).exec(function (err, res) {
                        console.log('----@@@-------- generated forget password code is ---------@@----', login_token);
                        if (res)
                            cb(null, res)
                        else
                            cb(err || Utils.responses.systemError);
                    });
                },
                function (data, cb) {    // send OTP mial.
                    console.log('----data at 3 is ------', data);
                    var username = Utils.universalfunctions.capitalizeFirstLetter(data.name);
                    var message = 'Your genrated OTP at reset password is ' + data.forget_verify_token + '.';
                    var templatepath = path.join(__dirname, '../emailTemplates/');

                    fileReadStream = fs.createReadStream(templatepath + 'common_otp_msg.html');

                    var emailTemplate = ' ';
                    fileReadStream.on('data', function (buffer) {
                        emailTemplate += buffer.toString();
                    });

                    fileReadStream.on('end', function (res) {
                        var sendStr = emailTemplate.replace('{{name}}', username + ',').replace('{message}', message);
                        var email_data = { // set email data object.
                            to: params.email,
                            from: '"PWayz Admin " <' + Configs.CONSTS.ADMIN_EMIAL + '>',
                            subject: 'PWayz- Forget password.',
                            html: sendStr
                        };

                        Utils.universalfunctions.send_email(email_data, function (err, res) {
                            if (err)
                                console.log('-----@@----- Error at sending report issue mail to user -----@@-----', err);
                            else
                                console.log('-----@@----- Response at sending report issue mail to user -----@@-----', res);
                        });
                    });
                    var data = {
                        login_token: data.login_token,
                        resObj: Utils.responses.forgetPasswordEmail
                    };

                    cb(null, data);
                }
            ], callback);
        }
        ;
    },
    // send or resed OTP SMS.
    sendOTP: (params, callback) => {

        async.waterfall([

            function (cb) {         // update the phone number verification code in DB.

                var phone_verification_token = Utils.universalfunctions.generateRandomString(4);

                Models.users.findOneAndUpdate({_id: params}, {phone_verification_token: phone_verification_token}, {new: true}).exec(function (err, res) {
                    if (res)
                        cb(null, res);
                    else
                        cb(err || Utils.responses.systemError);
                });
            },
            function (data, cb) {    // send OTP SMS.

                var requestObject = {
                    message: 'OTP for Pwayz is ' + data.phone_verification_token,
                    phone: data.phone
                };

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    console.log('-------- otp is --------', data.phone_verification_token);
                    if (err)
                        cb(err)
                    else
                        cb(null, Utils.responses.forgetPassword);
                });
            }
        ], callback);
    },
    // update user Password at profile update.
    updatePassword: (params, callback) => {

        async.waterfall([

            function (cb) {          // check the both old and new passwords are same or not.

                if (params.oldPassword === params.newPassword)
                    cb(Utils.responses.oldAndNewPasswordMatch, null);
                else
                    cb(null, params);
            },
            function (data, cb) {    // check the Old Password is valid or not.
                var encriptOldPass = Utils.universalfunctions.encryptpassword(params.oldPassword);
                if (encriptOldPass === params.userData.password)
                    cb(null, data);
                else
                    cb(Utils.responses.oldPassIncorrect, null);
            },

            function (data, cb) {    // Update user new Password.

                var encriptNewPass = Utils.universalfunctions.encryptpassword(params.newPassword);

                var queryObj = {
                        _id: params.userData._id
                    },

                    updateObj = {
                        password: encriptNewPass,
                        is_active: true
                    },

                    options = {
                        upsert: false,
                        new: true
                    };

                Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
                    if (res)
                        cb(null, res);
                    else
                        cb(err || Utils.responses.systemError)
                });
            },
            function (data, cb) {    // send update passowrd mial.
                console.log('------data is ----', data)
                if (data.email) {
                    var username = Utils.universalfunctions.capitalizeFirstLetter(data.name);
                    var message = 'Your account password updated successfully.';
                    var templatepath = path.join(__dirname, '../emailTemplates/');

                    fileReadStream = fs.createReadStream(templatepath + 'common_otp_msg.html');

                    var emailTemplate = ' ';
                    fileReadStream.on('data', function (buffer) {
                        emailTemplate += buffer.toString();
                    });

                    fileReadStream.on('end', function (res) {
                        var sendStr = emailTemplate.replace('{{name}}', username + ',').replace('{message}', message);
                        var email_data = { // set email data object.
                            to: data.email,
                            from: '"PWayz Admin " <' + Configs.CONSTS.ADMIN_EMIAL + '>',
                            subject: 'PWayz- Update password.',
                            html: sendStr
                        };

                        Utils.universalfunctions.send_email(email_data, function (err, res) {
                            if (err)
                                console.log('-----@@----- Error at sending report issue mail to user -----@@-----', err);
                            else
                                console.log('-----@@----- Response at sending report issue mail to user -----@@-----', res);
                        });
                    });
                }
                cb(null, data);
            },
            function (data, cb) {    // send OTP SMS.

                var requestObject = {
                    message: 'Your account password has been changed.',
                    phone: data.phone
                };

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    if (err)
                        console.log('----Error at sending password update SMS------', err);
                    else
                        console.log('----Response at sending password update SMS------', res);
                });
                cb(null, Utils.responses.passwordUpdated);
            }
        ], callback);
    },
    // verify OTP for both Phone Number and Email verification.
    verifyOTP: (params, callback) => {

        async.waterfall([

            function (cb) {

                var otp = '';
                var message = '';
                var updateObj = {
                    is_confirmed: true
                };

                if (params.type == 1) {      // 1- mobile verification.

                    Models.users.findOne({phone: params.userData.phone}, (err, res)=> {
                        if (err)
                            Utils.responses.systemError
                        else if (res) {
                            if (res.secondary_phone && res.secondary_phone.length > 0) {
                                updateObj.phone = res.secondary_phone;
                            }
                            otp = res.phone_verification_token;
                            updateObj.phone_is_verified = true;
                            updateObj.is_active = true;
                            updateObj.phone_verification_token = '';
                            updateObj.phoneModified_at = new Date(Date()).getTime() / 1000;
                            updateObj.modified_at = new Date(Date()).getTime() / 1000;
                            message = 'Mobile number verified successfully.';
                            if (otp === params.otp) {
                                params.updateObj = updateObj;
                                params.message = message;
                                cb(null, params);
                            } else
                                cb(Utils.responses.otpNotValid, null);
                        } else
                            cb(Utils.responses.phoneNumberNotExists);
                    });
                } else {                    // 2- email verification.

                    Models.users.findOne({phone: params.userData.phone}, (err, res)=> {
                        if (err)
                            Utils.responses.systemError
                        else if (res) {
                            if (res.secondary_email && res.secondary_email.length > 0) {
                                updateObj.email = res.secondary_email;
                            }
                            otp = res.email_verification_token;
                            updateObj.email_is_verified = true;
                            updateObj.is_active = true;
                            updateObj.email_verification_token = '';
                            updateObj.emailModified_at = new Date(Date()).getTime() / 1000;
                            updateObj.modified_at = new Date(Date()).getTime() / 1000;
                            message = 'Email verified successfully.';
                            if (otp === params.otp) {
                                params.updateObj = updateObj;
                                params.message = message;
                                cb(null, params);
                            } else
                                cb(Utils.responses.otpNotValid, null);
                        } else
                            callback(Utils.responses.emailnotExistForRole, null);
                    });
                }
                ;
            },
            function (data, cb) {    // generate the login token.
                console.log('--------at second stage----------', params);
                var tokenObj = {

                        phone: params.userData.phone,
                        is_confirmed: params.userData.is_confirmed,
                        email: params.userData.email,
                        email_is_verified: (params.updateObj.email_is_verified) ? params.updateObj.email_is_verified : false,
                        phone_is_verified: (params.updateObj.phone_is_verified) ? params.updateObj.phone_is_verified : false,
                        forgetPassword: params.userData.forgetPassword,
                        name: params.userData.name,
                        role: params.userData.role,
                        user_image: params.userData.user_image,
                        _id: params.userData._id
                    },

                    login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                        algorithm: Configs.CONSTS.jwtAlgo,
                        expiresIn: '2 days'
                    })
                params.user_data = tokenObj;
                params.updateObj.login_token = login_token;
                cb(null, params)
            },
            function (data, cb) {    // Update user new Password.

                var encriptNewPass = Utils.universalfunctions.encryptpassword(params.newPassword);

                var queryObj = {
                    _id: params.userData._id
                };
                var options = {
                    upsert: false,
                    new: true
                };

                Models.users.findOneAndUpdate(queryObj, params.updateObj, options).lean().exec(function (err, res) {
                    if (res) {
                        var response = {
                            user_data: params.user_data,
                            message: params.message,
                            login_token: res.login_token
                        };
                        cb(null, response);
                    } else {
                        cb(err || Utils.responses.systemError)
                    }
                });
            }
        ], callback);
    },
    // update user Password at forget password.
    forgetUpdatePassword: (params, callback) => {

        async.waterfall([

            function (cb) {    // generate the login token.

                var tokenObj = {
                        phone: params.userData.phone,
                        active_role: params.userData.active_role,
                        is_confirmed: params.userData.is_confirmed,
                        email: params.userData.email,
                        email_is_verified: params.userData.email_is_verified,
                        phone_is_verified: params.userData.phone_is_verified,
                        forgetPassword: false,
                        name: params.userData.name,
                        role: params.userData.role,
                        user_image: params.userData.user_image
                    },

                    login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                        algorithm: Configs.CONSTS.jwtAlgo,
                        expiresIn: '2 days'
                    }),

                    data = {
                        login_token: login_token
                    };

                cb(null, data)
            },
            function (data, cb) {    // Update user new Password.

                var encriptNewPass = Utils.universalfunctions.encryptpassword(params.newPassword);

                var queryObj = {
                        _id: params.userData._id
                    },

                    updateObj = {
                        password: encriptNewPass,
                        login_token: data.login_token,
                        forgetPassword: false,
                        forget_verify_token: "",
                        is_active: true
                    },

                    options = {
                        upsert: false,
                        new: true
                    };

                Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
                    if (res)
                        cb(null, res);
                    else
                        cb(err || Utils.responses.systemError)
                });
            },
            function (data, cb) {    // send OTP mial.
                console.log('----data at 3 is ------', data);
                var username = Utils.universalfunctions.capitalizeFirstLetter(data.name);
                var message = 'Your account password updated successfully.';
                var templatepath = path.join(__dirname, '../emailTemplates/');

                fileReadStream = fs.createReadStream(templatepath + 'common_otp_msg.html');

                var emailTemplate = ' ';
                fileReadStream.on('data', function (buffer) {
                    emailTemplate += buffer.toString();
                });

                fileReadStream.on('end', function (res) {
                    var sendStr = emailTemplate.replace('{{name}}', username + ',').replace('{message}', message);
                    var email_data = { // set email data object.
                        to: data.email,
                        from: '"PWayz Admin " <' + Configs.CONSTS.ADMIN_EMIAL + '>',
                        subject: 'PWayz- Update password.',
                        html: sendStr
                    };

                    Utils.universalfunctions.send_email(email_data, function (err, res) {
                        if (err)
                            console.log('-----@@----- Error at sending report issue mail to user -----@@-----', err);
                        else
                            console.log('-----@@----- Response at sending report issue mail to user -----@@-----', res);
                    });
                });

                cb(null, data);
            },
            function (data, cb) {    // send OTP SMS.

                var requestObject = {
                    message: 'Your password updated successfully.',
                    phone: data.phone
                };

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    if (err)
                        console.log('----Error at sending password update SMS-------', err)
                    else
                        console.log('----Response at sending password update SMS-------', res)
                });

                var response = {
                    login_token: data.login_token
                };
                cb(null, response);
            }

        ], callback);
    },
    // update email.
    updateEmail: (params, callback) => {

        async.waterfall([

            function (cb) {
                Utils.universalfunctions.check_email_exist(params.email, function (err, res) {
                    if (err) {
                        cb(err)
                    } else if (res && res.length > 0) {
                        cb(Utils.responses.emailAlreadyExists);
                    } else {
                        cb(null, params);
                    }
                });
            },
            function (data, cb) {
                var tokenObj = {
                        phone: params.user_data.phone,
                        is_confirmed: params.user_data.is_confirmed,
                        email: params.user_data.email,
                        email_is_verified: false,
                        secondary_email: data.email,
                        name: params.user_data.name,
                        role: params.user_data.role,
                        user_image: params.user_data.user_image
                    },

                    login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                        algorithm: Configs.CONSTS.jwtAlgo,
                        expiresIn: '2 days'
                    }),

                    queryObj = {
                        _id: data.user_data._id
                    },

                    updateObj = {
                        secondary_email: data.email,
                        modified_at: new Date(Date()).getTime() / 1000,
                        email_verification_token: Utils.universalfunctions.generateRandomString(4),
                        login_token: login_token,
                        email_is_verified: false,
                        is_active: true
                    },

                    options = {
                        new: true,
                        upsert: false
                    };

                Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, res)
                    }
                });

            },
            function (data, cb) {

                var username = Utils.universalfunctions.capitalizeFirstLetter(data.name),
                    token = data.email_verification_token,
                    templatepath = path.join(__dirname, '../emailTemplates/');

                fileReadStream = fs.createReadStream(templatepath + 'confirmNewEmail.html');

                var emailTemplate = ' ';
                fileReadStream.on('data', function (buffer) {
                    emailTemplate += buffer.toString();
                });

                fileReadStream.on('end', function (res) {
                    var sendStr = emailTemplate.replace('{{name}}', username).replace('{{token}}', token);
                    var email_data = { // set email variables for retailer
                        to: data.secondary_email,
                        from: '"PWayz Admin " <' + email_credentials.mailFrom + '>',
                        subject: 'PWayz- Update Email',
                        html: sendStr
                    };

                    Utils.universalfunctions.send_email(email_data, function (err, res) {
                        if (err) {
                            cb(err);
                        } else {

                            Utils.logger.successLogger('Response of update email mail', res);

                            var response = {
                                login_token: data.login_token
                            };

                            cb(null, response)

                        }
                    });
                })
            }
        ], function (err, res) {
            if (err) {
                logger.errorLogger("Error while updating user email", err)
            } else {
                logger.successLogger("Successfully updated user email", res)
            }
            callback(err, res)
        });
    },
    // update phone number.
    updatePhoneNumber: (params, callback) => {

        async.waterfall([

            function (cb) {
                Utils.universalfunctions.check_contact_exist(params.phone, function (err, res) {
                    if (err)
                        cb(err)
                    else if (res && res.length > 0)
                        cb(Utils.responses.contactAlreadyExists);
                    else {
                        cb(null, res[0])
                    }
                });
            },
            function (data, cb) {

                queryObj = {
                    _id: params.user_data._id
                },

                    updateObj = {
                        secondary_phone: params.phone,
                        modified_at: new Date(Date()).getTime() / 1000,
                        phone_verification_token: Utils.universalfunctions.generateRandomString(4),
                        phone_is_verified: false,
                        is_active: true
                    },

                    options = {
                        new: true,
                        upsert: false
                    };

                Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, res)
                    }
                });

            },
            function (data, cb) {

                var requestObject = {
                    message: 'OTP for Pwayz phone number verification is' + data.phone_verification_token,
                    phone: data.secondary_phone
                };

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    if (err)
                        console.log('------- error at SMS send secondary phone number verification token --------', err);
                    else
                        console.log('------- Response at SMS send secondary phone number verification token --------', res);
                });
                cb(null, Utils.responses.phoneNumChanged);
            }
        ], function (err, res) {
            if (err) {
                logger.errorLogger("Error while updating user phone number", err)
            } else {
                logger.successLogger("Successfully updated user phone number", res)
            }
            callback(err, res)
        });
    },
    // update profile image.
    updateImage: (params, callback) => {

        var tokenObj = {            //updating the token object with lateast image object
                phone: params.user_data.phone,
                is_confirmed: params.user_data.is_confirmed,
                email: params.user_data.email,
                email_is_verified: params.user_data.email_is_verified,
                secondary_email: params.user_data.email,
                name: params.user_data.name,
                role: params.user_data.role,
                user_image: params.image
            },

            login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                algorithm: Configs.CONSTS.jwtAlgo,
                expiresIn: '2 days'
            }),

            queryObj = {
                _id: params.user_data._id
            },

            updateObj = {
                user_image: params.image,
                modified_at: new Date(Date()).getTime() / 1000,
                login_token: login_token,
                is_active: true
            },

            options = {
                new: true,
                upsert: false
            };

        Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
            if (err) {
                logger.errorLogger("Error while updating user image", err)
                callback(err)
            } else {
                logger.successLogger("Successfully updated user image", res)
                var response = {
                    login_token: res.login_token
                };
                callback(null, response)
            }
        });
    },
    // user logout.
    logout: (params, callback) => {
        queryObj = {
            _id: params._id
        },

            updateObj = {
                login_token: "",
                device_token: {
                    send_notification: params.device_token.send_notification,
                    device_type: 0,
                    device_token: ""
                },
                last_active: 0
            },

            options = {
                new: true,
                upsert: false
            };

        Models.users.findOneAndUpdate(queryObj, updateObj, options).lean().exec(function (err, res) {
            if (err) {
                logger.errorLogger("Error while Logging out", err)
                callback(err)
            } else {
                logger.successLogger("User logged out Successfully ", res)
                callback(Utils.responses.logoutSuccessfull);
            }
        });
    },
    // contact us.
    contactUs: (params, callback) => {
        async.waterfall([

            function (cb) {         // save the contact details in DB.

                Models.support(params).save(function (err, res) {
                    if (err)
                        cb(err, null)
                    else
                        cb(null, res)
                });
            },
            function (data, cb) {    // send SMS to the user.

                var requestObject = {
                    message: 'Your query has been submitted successfully. We will contact you soon.',
                    phone: params.phone
                }

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    if (err) {
                        console.log('-----@@----- Error at Contact Us SMS sending -----@@-----', err)
                    } else {
                        console.log('-----@@----- Response at Contact Us SMS sending -----@@-----', res);
                    }
                });
                cb(null, data);
            },
            function (data, cb) {    // send mail to the user.

                var templatepath = path.join(__dirname, '../emailTemplates/');

                fileReadStream = fs.createReadStream(templatepath + 'contactUs.html');

                var emailTemplate = ' ';
                fileReadStream.on('data', function (buffer) {
                    emailTemplate += buffer.toString();
                });

                fileReadStream.on('end', function (res) {
                    var sendStr = emailTemplate;
                    var email_data = { // set email data object.
                        to: params.email,
                        from: '"PWayz Admin " <' + Configs.CONSTS.ADMIN_EMIAL + '>',
                        subject: 'PWayz- Contact support.',
                        html: sendStr
                    };

                    Utils.universalfunctions.send_email(email_data, function (err, res) {
                        if (err)
                            console.log('-----@@----- Error at sending contactUs mail to user -----@@-----', err);
                        else
                            console.log('-----@@----- Response at sending contactUs mail to user -----@@-----', res);
                    });
                    cb(null, params);
                })
            },
            function (data, cb) {    // send mail to the Admin.

                if (params.payment) {
                    var username = Utils.universalfunctions.capitalizeFirstLetter(params.name) + " has issues with payment."
                } else {
                    var username = Utils.universalfunctions.capitalizeFirstLetter(params.name) + " has submitted his issue/query."
                }
                var templatepath = path.join(__dirname, '../emailTemplates/');

                fileReadStream = fs.createReadStream(templatepath + 'contactUs_admin.html');

                var emailTemplate = ' ';
                fileReadStream.on('data', function (buffer) {
                    emailTemplate += buffer.toString();
                });

                fileReadStream.on('end', function (res) {
                    var sendStr = emailTemplate.replace('{name}', username).replace('{issue}', params.message).replace('{email}', params.email).replace('{phone}', params.phone);
                    var email_data = { // set email data object.
                        to: Configs.CONSTS.ADMIN_EMIAL,
                        from: '"PWayz Admin " <' + Configs.CONSTS.noReplyEmail + '>',
                        subject: 'PWayz- Contact support.',
                        html: sendStr,
                        cc: Configs.CONSTS.TESTER_EMAIL
                    };

                    Utils.universalfunctions.send_email(email_data, function (err, res) {
                        if (err)
                            console.log('-----@@----- Error at sending contactUs mail to admin -----@@-----', err);
                        else
                            console.log('-----@@----- Response at sending contactUs mail to admin -----@@-----', res);
                    });
                    cb(null, Utils.responses.contactUs);
                })
            }

        ], callback);
    },
    // report issue.
    reportIssue: (params, callback) => {

        async.waterfall([

            function (cb) {         // save the contact details in DB.

                var issueObj = {
                    userId: params.userData._id,
                    title: params.title,
                    description: params.description,
                    issue: params.issue,
                    image: params.image
                };

                Models.issue(issueObj).save(function (err, res) {
                    if (err)
                        cb(err, null)
                    else
                        cb(null, res)
                });
            },
            function (data, cb) {    // send SMS to the user.

                var requestObject = {
                    message: 'Your issue has been submitted successfully. We will contact you soon.',
                    phone: params.userData.phone
                }

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    if (err) {
                        console.log('-----@@----- Error at Contact Us SMS sending -----@@-----', err)
                    } else {
                        console.log('-----@@----- Response at Contact Us SMS sending -----@@-----', res);
                    }
                });
                cb(null, data);
            },
            function (data, cb) {    // send mail to the user.
                if (params.userData.email) {
                    var username = Utils.universalfunctions.capitalizeFirstLetter(params.userData.name);
                    var templatepath = path.join(__dirname, '../emailTemplates/');

                    fileReadStream = fs.createReadStream(templatepath + 'issue_user.html');

                    var emailTemplate = ' ';
                    fileReadStream.on('data', function (buffer) {
                        emailTemplate += buffer.toString();
                    });

                    fileReadStream.on('end', function (res) {
                        var sendStr = emailTemplate.replace('{name}', username).replace('{title}', params.title).replace('{description}', params.description).replace('{image}', '<img src="' + "http://pwaysdev.ignivastaging.com:9501/v1/utilities/image?image=" + params.image + '" alt="issue image" height="200" width="200">');
                        var email_data = { // set email data object.
                            to: params.userData.email,
                            from: '"PWayz Admin " <' + Configs.CONSTS.ADMIN_EMIAL + '>',
                            subject: 'PWayz- Contact support.',
                            html: sendStr
                        };

                        Utils.universalfunctions.send_email(email_data, function (err, res) {
                            if (err)
                                console.log('-----@@----- Error at sending report issue mail to user -----@@-----', err);
                            else
                                console.log('-----@@----- Response at sending report issue mail to user -----@@-----', res);
                        });
                    });
                    cb(null, params);
                } else
                    cb(null, params);
            },
            function (data, cb) {    // send mail to the Admin.

                var username = Utils.universalfunctions.capitalizeFirstLetter(params.userData.name);
                var templatepath = path.join(__dirname, '../emailTemplates/');

                fileReadStream = fs.createReadStream(templatepath + 'report_issue_admin.html');

                var emailTemplate = ' ';
                fileReadStream.on('data', function (buffer) {
                    emailTemplate += buffer.toString();
                });

                fileReadStream.on('end', function (res) {
                    var sendStr = emailTemplate.replace('{name}', username).replace('{title}', params.title).replace('{description}', params.description).replace('{image}', '<img src="' + "http://pwaysdev.ignivastaging.com:9501/v1/utilities/image?image=" + params.image + '" alt="issue image" height="200" width="200">');
                    var email_data = { // set email data object.
                        to: Configs.CONSTS.ADMIN_EMIAL,
                        from: '"PWayz Admin " <' + Configs.CONSTS.noReplyEmail + '>',
                        subject: 'PWayz- Contact support.',
                        html: sendStr,
                        cc: Configs.CONSTS.TESTER_EMAIL
                    };

                    Utils.universalfunctions.send_email(email_data, function (err, res) {
                        if (err)
                            console.log('-----@@----- Error at sending contactUs mail to admin -----@@-----', err);
                        else
                            console.log('-----@@----- Response at sending contactUs mail to admin -----@@-----', res);
                    });
                })
                cb(null, Utils.responses.reportIssue);
            }

        ], callback);
    },
    // Update Radius.
    UpdateRadius: (params, callback) => {

        async.waterfall([

            function (cb) {    // update the radius.

                var querObj = {
                        _id: params.userData._id
                    },
                    updateObj = {
                        driver_radius: params.radius,
                        is_active: true
                    }
                Models.users.findOneAndUpdate(querObj, updateObj).lean().exec(function (err, res) {
                    if (err)
                        cb(err, null);
                    else
                        cb(null, res);
                });
            },
            function (data, cb) {    // send SMS to the user.

                var requestObject = {
                    message: 'Your radius is updated successfully.',
                    phone: params.userData.phone
                };

                Utils.universalfunctions.sendSMS(requestObject, function (err, res) {
                    if (err)
                        console.log('-----@@----- Error at Contact Us SMS sending -----@@-----', err)
                    else
                        console.log('-----@@----- Response at Contact Us SMS sending -----@@-----', res);
                });
                cb(null, Utils.responses.updateRadius);
            }
        ], function (err, res) {
            if (err)
                callback(err)
            else
                callback(res)
        });
    },
    // Verify forget password OTP for both Phone Number and Email.
    verifyForgetOTP: (params, callback) => {

        if (params.type == 1) {          // for phone number entry.

            async.waterfall([
                function (cb) {         // check user phone number exist or not.

                    Utils.universalfunctions.check_contact_exist(params.phone, function (err, res) {

                        if (err) {
                            cb(err)
                        } else if (res && res.length > 0) {

                            if ((res[0].is_suspended))
                                cb(Utils.responses.suspended);
                            else {
                                if (params.otp == res[0].forget_verify_token)
                                    cb(null, res[0])
                                else
                                    cb(Utils.responses.otpNotValid, null);
                            }
                            ;
                        } else {
                            cb(Utils.responses.phoneNumberNotExists);
                        }
                    });
                },
                function (data, cb) {    // update verification in DB.

                    var tokenObj = {
                            phone: data.phone,
                            active_role: data.active_role,
                            is_confirmed: true,
                            email: data.email,
                            email_is_verified: data.email_is_verified,
                            phone_is_verified: true,
                            forgetPassword: false,
                            name: data.name,
                            role: data.role,
                            user_image: data.user_image
                        },

                        login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                            algorithm: Configs.CONSTS.jwtAlgo,
                            expiresIn: '2 days'
                        });

                    tokenObj.login_token = login_token;
                    tokenObj.forget_verify_token = "";
                    tokenObj.phone_verification_token = "";
                    tokenObj.is_active = true;

                    Models.users.findOneAndUpdate({phone: params.phone}, tokenObj, {new: true}).exec(function (err, res) {
                        if (res) {
                            var res = {
                                login_token: login_token
                            }
                            cb(null, res);
                        } else
                            cb(Utils.responses.systemError);
                    });
                }

            ], callback);
        } else {                        // for email entry.

            async.waterfall([

                function (cb) {         // check user email exist or not.

                    Models.users.findOne({email: params.email}, function (err, res) {

                        if (res) {
                            if (params.otp == res.forget_verify_token)
                                cb(null, res)
                            else
                                cb(Utils.responses.otpNotValid, null);
                        } else {
                            callback(Utils.responses.emailnotExistForRole, null);
                        }
                    });
                },
                function (data, cb) {    // update the user password in DB.

                    var tokenObj = {
                            phone: data.phone,
                            active_role: data.active_role,
                            is_confirmed: true,
                            email: data.email,
                            email_is_verified: true,
                            phone_is_verified: data.phone_is_verified,
                            forgetPassword: false,
                            name: data.name,
                            role: data.role,
                            user_image: data.user_image
                        },

                        login_token = jwt.sign(tokenObj, Configs.CONSTS.jwtkey, {
                            algorithm: Configs.CONSTS.jwtAlgo,
                            expiresIn: '2 days'
                        });

                    tokenObj.login_token = login_token;
                    tokenObj.forget_verify_token = "";
                    tokenObj.email_verification_token = "";
                    tokenObj.is_active = true;

                    Models.users.findOneAndUpdate({email: params.email}, tokenObj, {new: true}).exec(function (err, res) {
                        if (res) {
                            var res = {
                                login_token: login_token
                            }
                            cb(null, res);
                        } else
                            cb(Utils.responses.systemError, null);
                    });
                }

            ], callback);
        }
        ;
    },
    // Update user active role.
    updateActiveRole: (params, callback) => {

        console.log('--------------- service data is --------------', params);

        async.waterfall([

            function (cb) {    // Update user active role in DB.

                var updateObj = {

                        active_role: (params.active_role == 1) ? 2 : 1,
                        role: 3,
                        is_active: true,
                    },

                    tokenObj = {
                        phone: params.phone,
                        is_confirmed: params.is_confirmed,
                        email: params.email,
                        email_is_verified: params.email_is_verified,
                        phone_is_verified: params.phone_is_verified,
                        forgetPassword: false,
                        name: params.name,
                        user_image: params.user_image
                    };

                Models.users.findOneAndUpdate({phone: params.phone}, updateObj, {new: true}).exec(function (err, res) {

                    if (res) {

                        var message = (params.active_role == 1) ? "User role changed to Space Owner." : "User role changed to Driver."

                        cb(null, {statusCode: 200, status: "success", message: message, data: tokenObj});
                    } else
                        cb(err || Utils.responses.systemError)
                });
            }

        ], callback);
    },

};
