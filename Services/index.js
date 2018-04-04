/*-----------------------------------------------------------------------
   * @ file        : index.js
   * @ description : Main module to incluse all the service files.
   * @ author      : Anurag Gupta
   * @ date        :
-----------------------------------------------------------------------*/

'use strict';

module.exports = {

    BookService          : require('./Bookservices'),
    IssueBookService     : require('./IssueBookServices'),
    UserService          : require('./userServices'),
    
};
