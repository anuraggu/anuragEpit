/*-----------------------------------------------------------------------
 * @ file        : users.js
 * @ description : This file defines the user schema for mongodb.
 * @ author      : Anurag Gupta
 -----------------------------------------------------------------------*/

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const env = require('../env');

if (env.instance == "dev") {
    Mongoose.set('debug', true); // console mongo queries
}

var bookSchema = new Schema({
    bookName: {type: String},
    authorName: {type: String},
    price: {type: String},
    stock:{type:Number,},
    isEnabled:{type:Boolean,default:true}
});

var book = Mongoose.model('book', bookSchema);
module.exports = book;

function getTimeStamp() {
    return parseInt(Date.now() / 1000)
}
