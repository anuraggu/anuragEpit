
/*-----------------------------------------------------------------------
   * @ file        : plugIns.js
   * @ description : Here config all hapi plugIns and custom plugIns.
   * @ author      : Anurag Gupta
   * @ date        :
-----------------------------------------------------------------------*/

'use strict';

module.exports = [

    /*-----------------------
        Register inert
     ------------------------*/
    {
        register: require('inert'),
        options: {}
    },

    /*-----------------------
        Register vision
     ------------------------*/
    {
        register: require('vision'),
        options: {}
    },

    /*-----------------------
        Register Swagger
     ------------------------*/

    {
            'register': require('hapi-swagger'),
            'options': {
                info: {
                    'title': 'Epit API Documentation',
                    'version': '1.0.0'  //pack.version
                },
                pathPrefixSize: 2,
                basePath: '/v1',
                tags:[
                    {
                        name:'Users',
                        description:"All API's about User Operations"
                    } // here we can add more objects to devide and describe the categery wise end points.
                ]
            }
    },

    /*------------------
        Register good
     ------------------*/

    {
        register: require('good'),
        options : {
            ops: {
                interval: 1000
            },
            reporters: {
                myConsoleReporter: [{
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', response: '*' }]
                }, {
                    module: 'good-console'
                }, 'stdout']
            }
        }
    },
];
