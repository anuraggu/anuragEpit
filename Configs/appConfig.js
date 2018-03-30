
/*-----------------------------------------------------------------------
   * @ file        : appConstants.js
   * @ description : Includes all the app settings.
   * @ author      : Anurag Gupta
   * @ date        :
-----------------------------------------------------------------------*/

module.exports = {
    local: {
        name         : "epit",
        host         : "127.0.0.1", //'127.0.0.1',
        port         : "9033",
        absolutePath : __dirname+"/..",
        debug        : true
    },
    development: {
        name         : "epit",
        host         : "127.0.0.1", //'127.0.0.1',
        port         : "9033",
        absolutePath : __dirname+"/..",
        debug        : true
    },
    test: {
        name         : "TradePeople",
        host         : "",
        port         : "",
        absolutePath : __dirname+"/..",
        debug: true
    },
    live: {
        name         : "",
        host         : "",
        port         : "",
        absolutePath : __dirname+"/..",
        debug        : true
    }

};
//module.exports.GOOGLE_TIMEZONE_API__KEY = GOOGLE_TIMEZONE_API__KEY
//module.exports.STATUS_MSG = STATUS_MSG
