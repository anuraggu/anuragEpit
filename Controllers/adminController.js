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
const SOCIAL_MODE = APP_CONSTANTS.SOCIAL_MODE;
const USER_TYPE = APP_CONSTANTS.USER_TYPE;

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



var login = function (payloadData, userData, CallbackRoute) {
    var returnedData, token, verificationToken, registerSocialId;
    var RunQuery = "Insert";
    async.auto({
        verifyEmailAddress: [(cb)=> {
            if (!Utils.universalfunctions.verifyEmailFormat(payloadData.email)) return cb(Responses.INVALID_EMAIL);
            return cb();
        }],
        getUserData: ['verifyEmailAddress', (r1, cb)=> {
            var Criteria = {
                email:payloadData.email,
                user_type:USER_TYPE.ADMIN
                //encryptpassword:encryptpassword
            };//console.log("Criteria", Criteria);
            Service.UserService.getUser(Criteria, {}, {}, (err, data)=> { //console.log("getUserData",err, data)
                if (err) return cb(err);
                returnedData = data[0];
                if (data && data.length > 0 && data[0].email) {
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
        setAccesToken: ['getUserData', (r3, cb)=> { //console.log("setAccesToken init")
            var setCriteria = {_id: returnedData._id};
            token = jwt.sign({
                id: returnedData._id,
                email: returnedData.email
            }, Configs.CONSTS.jwtkey, {
                algorithm: Configs.CONSTS.jwtAlgo,
               // expiresIn: '2 days'
            });
            console.log("token", token);
            var setQuery = {
                updatedAt: new Date(),
                accessToken: token,
            };
            Service.UserService.updateUser(setCriteria, setQuery, {new: true}, (err, data)=> { //console.log("err, data",err, data);
                if (err) return cb(err)
                returnedData = data;
                return cb(null, data);
            });
        }],

    }, (err, result)=> {
        if (err) return CallbackRoute(err);
        return CallbackRoute(null, {
            accessToken: returnedData.accessToken,
            userDetails: returnedData
        });
    });
}

var registerStudent = function (payloadData, userData, CallbackRoute) {
    var returnedData, token, verificationToken, registerSocialId;
    async.auto({
        verifyEmailAddress: [(cb)=> {
            if (!Utils.universalfunctions.verifyEmailFormat(payloadData.email)) return cb(Responses.INVALID_EMAIL);
            return cb();
        }],
        getUserData: ['verifyEmailAddress',(r1, cb)=> {
            var getCriteria = {
                email: payloadData.email,
            };
            
            Service.UserService.getUser(getCriteria, {password: 0, accessToken: 0}, {}, function (err, data) {
                console.log("getUserData", err, data)
                if (err) return cb({errorMessage: 'DB Error: ' + err})
                if (data.length > 0 ) return cb(Responses.EMAIL_ALREADY_EXIST);
                return cb()
            });
        }],
        createUser: ['getUserData', (r2, Incb)=> {
            var dataToSet = payloadData;
                //console.log("dataToSet", dataToSet);
                if (payloadData.password) {
                    var password = Utils.universalfunctions.encryptpassword(payloadData.password);  //UniversalFunctions.CryptData(res + res1);
                    dataToSet.password = password;
                }
                Service.UserService.createUser(dataToSet, (err, data)=> {
                    if (err)  return Incb(err);
                    returnedData = data;
                    return Incb();
                });
        }],        
        
        
    }, (err, result)=> {
        if (err) return CallbackRoute(err);
        return CallbackRoute(null, {
            accessToken: returnedData.accessToken,
            userDetails: returnedData
        });
    });
}

var addBooks = function (payloadData, userData, CallbackRoute) {
    async.auto({
       InsertBook:[(cb)=>{
            Service.BookService.InsertData(payloadData, (err, data)=> {
                if (err)  return cb(err);
                returnedData = data;
                return cb();
            }); 
       }] 
    },function(err,result){
        if(err) return CallbackRoute(err);
        return CallbackRoute();
    });//console.log("hre",userData);
}

var getAllbooks = function (payloadData,callbackRoute) {
    var totalRecord=0;
    var finalData=[]; 
    var criteria= {};
    var projection={};    
    async.auto({
        getData:[(cb)=>{
            var options= {
                skip:payloadData.skip,
                limit:payloadData.limit,
                lean:true,
                sort:{
                    bookName:1
                }
            };          
           Service.BookService.getData(criteria, projection, options,(err,data)=> { 
                if (err)  return cb(err);
                finalData = data                        
                return cb();
           });
        }],
        coutTotalRecord:[(cb)=>{
            var options= {
                lean:true
            };          
           Service.BookService.getData(criteria,projection,options,(err,data)=> { 
                if (err)  return cb(err);
                totalRecord = data.length;                      
                return cb();
           });
        }],    
    }, (err,result)=> { //console.log("===erredatarrerr===",err,result)
        if (err) return callbackRoute(err);
        return callbackRoute(null, {
            totalRecord: totalRecord,
            postListing: finalData
        });
    })   

}

var IssueBook = function (payloadData, userData, CallbackRoute) {
    var bookData;
    async.auto({
        getBookData:[(cb)=>{
            var criteria ={
               _id:payloadData.bookId
            }
            Service.BookService.getData(criteria, {}, {}, (err, data)=> {
                if (err)  return cb(err);
                if(data.length==0) return cb({
                    statusCode:400,
                    message:'Book Is Not Valid'
                });
                bookData = data[0];
                return cb();
            }); 
       }],
       InsertBook:['getBookData',(ag1,cb)=>{
        var dataTOInsert ={
            bookId:payloadData.bookId,
            userId:payloadData.userId,
            IssueBy:userData._id,
            issueDate:new Date().toISOString(),
            created_at:new Date().toISOString(),
        }
            Service.IssueBookService.InsertData(dataTOInsert, (err, data)=> {
                if (err)  return cb(err);
                returnedData = data;
                return cb();
            }); 
       }] 
    },function(err,result){
        if(err) return CallbackRoute(err);
        return CallbackRoute();
    });//console.log("hre",userData);
    
}

var returnBooks = function (payloadData, userData, CallbackRoute) {
    var bookData;
    async.auto({
       updateBook:[(cb)=>{
        var dataTOInsert ={
            returnDate:new Date().toISOString(),
            }
        var criteria ={
               bookId:payloadData.bookId,
               userId:payloadData.userId
            }
            Service.IssueBookService.updateData(criteria,dataTOInsert,{}, (err, data)=> {
                if (err)  return cb(err);
                returnedData = data;
                return cb();
            }); 
       }] 
    },function(err,result){
        if(err) return CallbackRoute(err);
        return CallbackRoute();
    });//console.log("hre",userData);
    
}



module.exports = {
    login: login,
    registerStudent:registerStudent,
    addBooks:addBooks,
    getAllbooks:getAllbooks,
    IssueBook:IssueBook,
    returnBooks:returnBooks
    
}