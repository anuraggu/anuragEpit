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

var issuebookSchema = new Schema({
    bookId: {
        type:Schema.Types.ObjectId,
        required:true,
        ref:"book",
    },
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"user",
    },
    IssueBy:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"user",
    },
    issueDate: {type: Date, default: new Date},
    returnDate: {type: Date},
    created_at: {type: Date, default: new Date},    
});

var issuebook = Mongoose.model('issuebook', issuebookSchema);
module.exports = issuebook;

