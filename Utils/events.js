
/*-----------------------------------------------------------------------
   * @ file        : scheduler.js
   * @ description : Main module containing all the Event management functonality
   * @ author      : Ravinder Rikhi
   * @ date        : 30th May, 2017
-----------------------------------------------------------------------*/
//internal modules
var events     = require('events');
var eventEmitter = new events.EventEmitter();

module.exports = eventEmitter; 
