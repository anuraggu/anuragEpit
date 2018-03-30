/*

 * @date: 09-March-2017
 * @author: Anurag
 * */
'use strict';
var UniversalFunctions = require('../Utils/');
var responses          =  require('../Utils/responses') //UniversalFunctions.responses;//console.log(responses);
var Models             = require('../Models');

/*
 ---------------------------------------------------------------------------------------------
 WARNING: Not a general module just for category-sub-service tree or for two level tree only
 ---------------------------------------------------------------------------------------------
 */

exports.getDataDeepPopulateFixed = function (model, query, projectionQuery, options, populateModel, nestedModel, callback) {
    model.find(query, projectionQuery, options).populate(populateModel).exec(function (err, docs) {
        if (err)  return callback(err, docs);
        model.populate(docs, nestedModel,function (err,populatedDocs) { //console.log("populatedDocs",populatedDocs);
            if (err) return callback(err);
            callback(null, populatedDocs);// This object should now be populated accordingly.
        });
    });
};


/*
 ----------------------------------------
 GET DATA WITH REFERENCE
 ----------------------------------------
 */

//Models.OrderTable,criteria, projection, option,populateModel
exports.getDataWithReferenceFixed = function (model, query, projection, options, collectionOptions, callback) { //console.log("options",options);

    model.find(query, projection, options).populate(collectionOptions).exec(function (err, data) {
        //model.find(query).select(projection).populate(collectionOptions).sort(options).exec(function (err, data) {

        if (err) {
            //logger.error("Error Data reference: ", err);
            var response = {
                message: ERROR_MESSAGE.ERROR_IN_EXECUTION,//constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            callback(errResponse);
        }
        else {

            callback(null, data);
        }
    });
};
exports.findOneAndUpdateData = function (model, conditions, update, options, callback) {
    model.findOneAndUpdate(conditions, update, options, function (error, result) {
        if (error) {
            //logger.error("Find one and update", error);
            return callback(error);
        }
        return callback(null, result);
    })
}

exports.UpdateMultipleRecords = function (model, conditions, update, options, callback) {
    model.update(conditions, update, options, function (error, result) {
        if (error) { console.log("xerrorxx",error);
            //logger.error("update multiple", error);
            return callback(error);
        }
        return callback(null, result);
    })
}

exports.getDataWithReferenceFixedAndSort = function (model, query, projection, options, collectionOptions, callback) { //console.log("options",options);

    //model.find(query, projection, options).populate(collectionOptions).exec(function (err, data) {
    model.find(query).select(projection).populate(collectionOptions).sort(options).exec(function (err, data) {

        if (err) {
            //logger.error("Error Data reference: ", err);
            var response = {
                message: ERROR_MESSAGE.ERROR_IN_EXECUTION,//constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            callback(errResponse);
        }
        else {

            callback(null, data);
        }
    });
};
exports.getDataWithSort = function (model,criteria, projection, options, callback) {
    //console.log("asdasd",model,criteria, projection, options);
    model.find(criteria).select(projection).sort(options).exec(function (err, data) {
        if(err) return callback(err);
        return callback(null,data);
    });
};


exports.countData = function (model,criteria,callback) {
    model.count(criteria, callback);
};
exports.aggregate =function (table_name,group, callback) {
    table_name.aggregate(group, function (err, data) { //Models.Customers
        callback(err, data);
    });
};

exports.getDataPopulateOneLevel = function (model,query,projectionQuery,options,populateModel,callback) { //console.log("populateModel",projectionQuery,"=====",populateModel);
    model.find(query, projectionQuery, options).populate(populateModel).exec(function (err, docs){
        if (err)  return callback(err);
        return callback(null, docs);
    });
};

exports.getDataDeepPopulateFixed= function (model, query, projectionQuery, options, populateModel, nestedModel, callback) {
    model.find(query, projectionQuery, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }
        model.populate(docs, nestedModel, function (err, populatedDocs) {
            if (err) return callback(err);
            callback(null, populatedDocs);// This object should now be populated accordingly.
        });
    });
};
exports.findDBData = function (model,criteria,projection,options,callback) { //console.log("populateModel",projectionQuery,"=====",populateModel);
    model.find(criteria, projection, options, function(err,result){
        if(err)  return callback(err);
        return callback(null,result);
    });
};

exports.SaveDataToDB = function (model,objToSave, callback) {
    new model(objToSave).save(function(err,result){
        if(err)return callback(err);
        return callback(null,result);
    })
};

exports.findAndDelete = function (model,criteria,options,callback) { //console.log("populateModel",projectionQuery,"=====",populateModel);
    model.find(criteria,options).remove(function(err,result){
        if(err)  return callback(err);
        return callback(null,result);
    });
};