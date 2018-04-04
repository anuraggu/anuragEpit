/*-----------------------------------------------------------------------
   * @ file        : dbConstants.js
   * @ description : Includes all the db settings.
   * @ author      : Anurag Gupta
   * @ date        :
-----------------------------------------------------------------------*/
//mongodb://anurag:123456@ds127888.mlab.com:27888/library3
module.exports = {
    local: {
        name: "epit",
        host: "ds127888.mlab.com:27888/library3",
        username: "anurag",
        password: "123456",
        port: "27888"
    },
    local: {
        name: "epit",
        host: "127.0.0.1",
        username: "",
        password: "",
        port: "27017"
    },
    development: {
        name: "epit",
        host: "127.0.0.1",
        username: "",
        password: "",
        port: "27017"
    },
    test: {
        name: "epit",
        host: "127.0.0.1",
        username: "",
        password: "",
        port: "27017"
    },
    live: {
        name: "DB_Name",
        host: "",
        username: "",
        password: "",
        port: ""
    }


};