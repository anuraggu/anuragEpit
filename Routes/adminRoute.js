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

var checkAccessToken              = require('../Utils/universalfunctions').getTokenFromDB;
var checkAdminTokenFromDB         = require('../Utils/universalfunctions').getAdminTokenFromDB;


/*--------------------------------------------
 * Include external modules.
 ---------------------------------------------*/
var Joi = require('joi');

var login = {
    method: 'POST',
    path: '/v1/admin/login',
    config: {
        description: 'login',
        tags: ['api', 'admin'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                email: Joi.string().email().lowercase().required(),
                password: Joi.string().required()
                //password: Joi.string().required().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({ language: { string: { regex: { base: 'Password must contain atleast 8 characters including a number' } } } }).label('Password'),
            },
            failAction: FailActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
            }
        }
    },
    handler: function (request, reply) {
        Controller.adminController.login(request.payload, {}, (err, data)=> {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                reply(sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data.userDetails)).header('accessToken', data.accessToken);
            }
        });
    },
}


var registerStudent = {
    method: 'POST',
    path: '/v1/admin/registerStudent',
    config: {
        description: 'Add User',
        tags: ['api', 'User'],
        //pre: [{ method: accessToken, assign: 'verify' }],
        validate: {
            payload: {
                name: Joi.string().lowercase().trim().min(2).optional(),
                email: Joi.string().trim().required().lowercase().regex(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/).options({language: {string: {regex: {base: 'email.'}}}}).label("Invalid"),
                password: Joi.string().optional().regex(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]{8,14}$/).options({language: {string: {regex: {base: ' should be between 8-14 characters and must be alphanumeric.'}}}}).label('Password'),
                user_type: Joi.string().required().valid([USER_TYPE.STUDENT]),
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        Controller.adminController.registerStudent(request.payload, {}, (err, data)=> {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
                reply(sendSuccess(messageObject, data.userDetails)).header('accessToken', data.accessToken);
            }
        });
    },
}

var addBooks = {
    method: 'POST',
    path: '/v1/admin/addBooks',
    config: {
        description: 'Add User',
        tags: ['api', 'User'],
        pre: [{ method: checkAdminTokenFromDB, assign: 'verify' }],
        validate: {
            payload: {
                bookName: Joi.string().lowercase().trim().min(2).required(),
                authorName: Joi.string().lowercase().trim().min(2).required(),
                price: Joi.number().min(2).required(),
                stock: Joi.number().required(),
                accessToken:Joi.string().required()
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        var UserData = request.pre.verify.userData[0];
        Controller.adminController.addBooks(request.payload,UserData, (err, data)=> {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
                reply(sendSuccess(messageObject, data));
            }
        });
    },
}


var getAllbooks = {
    method: 'GET',
    path: '/v1/admin/getAllbooks',
    config: {
        description: 'api to get list of all the books',
        tags: ['api', 'Admin'],
        pre: [{method: checkAdminTokenFromDB, assign: 'verify'}],
        validate: {
            query: {               
                skip: Joi.number().required(),
                limit: Joi.number().required(),   
                accessToken: Joi.string().required(),             
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) { console.log("errRoute",request.headers);
        Controller.adminController.getAllbooks(request.query,function (err, data) {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                reply({ 
                    "statusCode": 200,
                    "message": "Success",
                    data:data
                })
            }
        });
    },
}

var IssueBooks = {
    method: 'POST',
    path: '/v1/admin/IssueBooks',
    config: {
        description: 'Add IssueBooks',
        tags: ['api', 'Admin'],
        pre: [{ method: checkAdminTokenFromDB, assign: 'verify' }],
        validate: {
            payload: {
                userId: Joi.string().trim().length(24).required(),
                bookId: Joi.string().trim().length(24).required(),
                accessToken:Joi.string().required()
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        var UserData = request.pre.verify.userData[0];
        Controller.adminController.IssueBook(request.payload,UserData, (err, data)=> {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
                reply(sendSuccess(messageObject, data));
            }
        });
    },
}

var returnBooks = {
    method: 'POST',
    path: '/v1/admin/returnBooks',
    config: {
        description: 'Add IssueBooks',
        tags: ['api', 'Admin'],
        pre: [{ method: checkAdminTokenFromDB, assign: 'verify' }],
        validate: {
            payload: {
                userId: Joi.string().trim().length(24).required(),
                bookId: Joi.string().trim().length(24).required(),
                accessToken:Joi.string().required()
            },
            failAction: FailActionFunction
        }
    },
    handler: function (request, reply) {
        var UserData = request.pre.verify.userData[0];
        Controller.adminController.returnBooks(request.payload,UserData, (err, data)=> {
            if (err) { //console.log("errRoute",err);
                reply(sendError(err));
            } else {
                var messageObject = APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
                reply(sendSuccess(messageObject, data));
            }
        });
    },
}


module.exports = [
    login,
    registerStudent,
    addBooks,
    getAllbooks,
    IssueBooks,
    returnBooks
    
]