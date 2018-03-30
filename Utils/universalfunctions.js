/*-----------------------------------------------------------------------
 * @ file        : users.js
 * @ description : Here defines all users routes.
 * @ author      : Anurag Gupta
 * @ date        :
 -----------------------------------------------------------------------*/

'use strict';

/*--------------------------------------------
 * Include internal and external modules.
 ---------------------------------------------*/

// external modules.
const md5 = require('md5');
const async = require('async');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const Joi = require('joi');
const Boom = require('boom');
const timezoner = require('timezoner');
const moment = require('moment');
const validator = require('validator');

const Models = require('../Models');
const messages = require('./responses');
//const messenger = require('./twilioMessenger')
const Configs = require('../Configs');
const CONSTS = Configs.CONSTS;
const env = require('../env');
const eventEmitter = require('./events');
const logger = require('./logger');
const saltRounds = 10;
const Responses = require('./responses');

const GOOGLE_TIMEZONE_API__KEY = Configs.CONSTS.GOOGLE_TIMEZONE_API__KEY //Configs.app.GOOGLE_TIMEZONE_API__KEY;
const STATUS_MSG = Responses.STATUS_MSG.SUCCESS // Configs.app.STATUS_MSG;
const USER_TYPE = CONSTS.USER_TYPE // Configs.app.STATUS_MSG;

const DbCommonFunction = require('./dbCommonFunction');
const Services = require('../Services');

var  failActionFunction = function (request, reply, source, error) {
        var customErrorMessage = '';
        if (error.output.payload.message.indexOf("[") > -1) {
            customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
        } else {
            customErrorMessage = error.output.payload.message;
        }
        customErrorMessage = customErrorMessage.replace(/"/g, '');
        customErrorMessage = customErrorMessage.replace('[', '');
        customErrorMessage = customErrorMessage.replace(']', '');
        error.output.payload.message = customErrorMessage;
        delete error.output.payload.validation
        return reply(error);
}

var getTokenFromDB = (request, reply) => {
    console.log("getTokenFromDB==init===");
    //var token = request.payload.accessToken;
    var token = (request.payload != null && (request.payload.accessToken)) ? request.payload.accessToken : ((request.params && request.params.accessToken) ? request.params.accessToken : request.headers['accesstoken']);
    var userData = null;
    var usertype, userId, criteria;
    async.series([
        (cb) => {
            console.log("init==1");
            jwt.verify(token, Configs.CONSTS.jwtkey, function (err, decoded) {
                if (err) return cb(messages.TOKEN_EXIRED);
                userId = decoded.id;
                criteria = {
                    _id: userId,
                    accessToken: token,
                }; //console.log("asdsa====xxx",err,userId,criteria);
                return cb();
            });
        },
        (cb) => {
            console.log("init==2");
            Services.UserService.getUser(criteria, {}, {lean: true}, function (err, dataAry) { // console.log('jwt err++++++',criteria,dataAry)
                if (err) return cb(err)
                if (dataAry && dataAry.length == 0) return cb(messages.TOKEN_NOT_VALID);
                userData = dataAry;
                return cb()
            });
        }
    ], (err, result) => { //console.log("XXXXXX",err);
        if (err) {
            reply(err).takeover(); //reply(sendError(err)).takeover(); //
        } else {
            if (userData && userData._id) {
                userData.id = userData._id;
                userData.type = userType;
            }
            reply({userData: userData}) //return callbackRoute(null,{userData: userData});
        }

    });
};

var sendSuccess = function (successMsg, data) { //console.log("successMsg",successMsg);
    successMsg = successMsg || STATUS_MSG.SUCCESS.DEFAULT.customMessage;
    if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('customMessage')) {
        return {statusCode: successMsg.statusCode, message: successMsg.customMessage, data: data || null};

    } else {
        return {statusCode: 200, message: successMsg, data: data || null};

    }
};

var sendError = function (data) { //console.log("sadsasa+++++",data.errmsg);
    if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) { //console.log("sadsadsa_if",data);
        var errorToSend = Boom.create(data.statusCode, data.customMessage);
        errorToSend.output.payload.responseType = data.type;
        if (data.error) {
            errorToSend.output.payload.error = data.error;
        }
        if (data.name == 'MongoError') {
            return errorToSend.output.payload.error = data.errmsg
        }
        return errorToSend;
    } else {
        return data
    }
};
var allowAccessTokenInHeader = function () {
    return Joi.object({'accessToken': Joi.string().trim().required()}).options({allowUnknown: true});
}
var bootstrapAdmin = function (callback) {
	var needToCreate=true;
    var adminData1 = 
	    {
	        email: 'anurag.gupta816@gmail.com',
	        password: 'anurag123',
	        name: 'Anurag Gupta',
	        phone: 9988842200,
	        countryCode: '+91',
	        user_type: USER_TYPE.ADMIN
	    };
    
    
    async.series([function (cb) {
        var criteria = {
            email: adminData1.email
        };
        Services.UserService.getUser(criteria, {}, {}, function (err, data) {
            if (data && data.length > 0) {
                needToCreate = false;
            }
            cb()
        })
    }, function (cb) {
        console.log("needToCreate", needToCreate);
        if (needToCreate) {
            console.log(adminData1.email)
            adminData1.email = adminData1.email.toLowerCase();
            adminData1.password = md5(adminData1.password); //commonFunctions.encryptpassword(adminData.password);
            Services.UserService.createUser(adminData1, function (err, data) { //console.log("sdsds",err, data)
                cb(err, data)
            })
        } else {
            cb();
        }
    }], function (err, data) {
        //console.log('Bootstrapping finished for ' + email);
        callback(err, 'Bootstrapping finished' + adminData1.email)
    })
};
var verifyEmailFormat = function (string) {
    return validator.isEmail(string)
};

var encryptpassword = function (request) { // password encryption.

        return md5(request);
    }

var getAdminTokenFromDB = (request, reply) => { console.log("getTokenFromDB==init===",request.query.accessToken);
    //var token = request.payload.accessToken;
    var token = (request.payload != null && (request.payload.accessToken)) ? request.payload.accessToken : ((request.query && request.query.accessToken) ? request.query.accessToken : request.headers['accesstoken']);
    var userData = null;
    var usertype, userId, criteria;
    async.series([
        (cb) => { console.log("token",token);
            jwt.verify(token, Configs.CONSTS.jwtkey, function (err, decoded) {
                if (err) return cb(messages.TOKEN_NOT_VALID);
                userId = decoded.id;
                criteria = {
                    _id: userId,
                    accessToken: token,
                    user_type: USER_TYPE.ADMIN

                }; console.log("asdsa====xxx",err,userId,criteria);
                return cb();
            });
        },
        (cb) => {
            Services.UserService.getUser(criteria, {}, {lean: true}, function (err, dataAry) { // console.log('jwt err++++++',criteria,dataAry)
                if (err) return cb(err)
                if (dataAry && dataAry.length == 0) return cb(messages.TOKEN_NOT_VALID);
                userData = dataAry;
                return cb()
            });
        }
    ], (err, result) => { //console.log("XXXXXX",err);
        if (err) {
            reply(sendError(err)); //reply(sendError(err)).takeover(); //
        } else {
            if (userData && userData._id) {
                userData.id = userData._id;
                userData.type = userType;
            }
            reply({userData: userData}) //return callbackRoute(null,{userData: userData});
        }

    });
};



module.exports = {
	allowAccessTokenInHeader:allowAccessTokenInHeader,
	bootstrapAdmin:bootstrapAdmin,
   failActionFunction:failActionFunction,
   getTokenFromDB:getTokenFromDB,
   sendSuccess:sendSuccess,
   sendError:sendError,
   verifyEmailFormat:verifyEmailFormat,
   encryptpassword:encryptpassword,
   getAdminTokenFromDB:getAdminTokenFromDB,
}