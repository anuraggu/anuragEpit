'use strict';
var UniversalFunctions = require('../Utils/');
var responses   =  require('../Utils/responses') //UniversalFunctions.responses;
var Models = require('../Models');
var table_name = Models.users;

//Get Users from DB

var getUser = function (criteria, projection, options, callback) {
    table_name.find(criteria, projection, options, function(err,result){ console.log("criteria_err",err);
        if(err) {
            if(err.name=="CastError") return callback(responses.INVALID_USER_ID);
            return callback(err);
        }
        return callback(null,result);
    });
};

//Insert User in DB
var createUser = function (objToSave, callback) {
    new table_name(objToSave).save(function(err,result){
        if(err) { console.log("==========createUser==============",err);
            if (err.code == 11000 && err.message.indexOf('email_1') > -1) return  callback(responses.EMAIL_ALREADY_EXIST);
            if (err.code == 11000 && err.message.indexOf('licenseNumber_1') > -1) return  callback(responses.LICENSE_NUMBER_ALREADY_EXIST);
            if (err.code == 11000 && err.message.indexOf('facebookId_1') > -1) return  callback(responses.FACEBOOK_ID_EXIST);
            if (err.code == 11000 && err.message.indexOf('linkedinId_1') > -1) return  callback(responses.LINKEDINID_ID_EXIST);
            //if (err.code == 11000 && err.message.indexOf('socialId_1') > -1) return  callback(responses.SOCIAL_ID_ALREADY_EXIST);
            return callback(err);
        }
        return callback(null,result);
    })
};

//Update User in DB
var updateUser = function (criteria, dataToSet, options, callback) { //console.log("here+++++++xxxx++++",criteria,dataToSet);
    table_name.findOneAndUpdate(criteria, dataToSet, options, function(err,result){
        if(err) { console.log("==========updateUser===========",err);
            if(err.name=="CastError") return callback(responses.INVALID_USER_ID);
            if (err.code == 11000 && err.message.indexOf('email_1') > -1) return  callback(responses.EMAIL_ALREADY_EXIST);
            if (err.code == 11000 && err.message.indexOf('licenseNumber_1') > -1) return  callback(responses.LICENSE_NUMBER_ALREADY_EXIST);
            if (err.code == 11000 && err.message.indexOf('facebookId_1') > -1) return  callback(responses.FACEBOOK_ID_EXIST);
            if (err.code ==11000 && err.message.indexOf('linkedinId_1') > -1) return  callback(responses.LINKEDINID_ID_EXIST);
            //if (err.code == 11000 && err.message.indexOf('socialId_1') > -1) return  callback(responses.SOCIAL_ID_ALREADY_EXIST);
            return callback(err);
        }
        return callback(null,result);
    });
};

module.exports = {
    getUser     : getUser,
    createUser  : createUser,
    updateUser  : updateUser
};