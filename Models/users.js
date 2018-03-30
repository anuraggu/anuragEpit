/*-----------------------------------------------------------------------
 * @ file        : users.js
 * @ description : This file defines the user schema for mongodb.
 * @ author      : Ravinder Rikhi
 * @ date        : 27 April, 2017
 -----------------------------------------------------------------------*/

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const env = require('../env');

if (env.instance == "dev") {
    Mongoose.set('debug', true); // console mongo queries
}

var UserSchema = new Schema({
    name: {type: String},
    phone: {type: String},
    password: {type: String},
    accessToken: {type: String},
    email: {type: String, trim: true, index: true, unique: true, sparse: true},
    created_at: {type: Number, default: getTimeStamp},
    modified_at: {type: Number},
    user_type: {type: String},
    
});
var user = Mongoose.model('user', UserSchema);
module.exports = user;

function getTimeStamp() {
    return parseInt(Date.now() / 1000)
}
