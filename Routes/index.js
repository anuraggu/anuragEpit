
/*-----------------------------------------------------------------------
   * @ file        : index.js
   * @ description : Main module to incluse all the Routes.
   * @ author      : Anurag Gupta
   * @ date        :
-----------------------------------------------------------------------*/

'use strict';

//const userRoute     = require('./userRoute');
const adminRoute  = require('./adminRoute');


module.exports = [].concat(adminRoute);

