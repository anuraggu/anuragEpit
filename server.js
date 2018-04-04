/*---------------------------------------------------------------------------------
 * @ file        : server.js
 * @ description : This is the main startup server file to init the application.
 * @ author      : Duddukuri Mahesh
 * @ date        :
 pm2 start server.js --name tradePeoeple --log-date-format 'YYYY-MM-DD-HH:mm-Z'
 ----------------------------------------------------------------------------------*/

// Include external modules.
const Hapi = require('hapi');
const mongoose = require('mongoose');

// Include internal modules.
const plugIns = require('./PlugIns');
const configs = require('./Configs');
const env = require('./env');
const Utils = require('./Utils');
const app = configs.app[env.instance];
const db = configs.db [env.instance];
const server = new Hapi.Server();
const routes = require('./Routes');
const im = require('imagemagick');
//const scheduler= require('./Utils').scheduler;

// creating REST API server connection.
console.log(app);
server.connection({
    host: app.host,
    port: app.port,
    routes: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['x-logintoken'],
            additionalExposedHeaders: ['x-logintoken']
        }
    },
    labels: ['api']
}, {
    timeout: {
        server: 50000
    },
})
;

// creating SOCKET server connection.
server.connection({
    port: app.socket,
    labels: ['ws']
});

const apiServer = server.select('api');

console.log('\x1b[32m', "+++ SERVER SETTINGS LOADED +++\r\n" + JSON.stringify(app) + "\n");

// configure all routes to server object.
server.route([
    {
        method: 'GET',
        path: '/compressed/{name}/{size?}',
        handler: function(request, reply) {
            // console.log(request.params.name,request.params.size)
            if (request.params.size) {
                var size = request.params.size;
                var widthheight = size.split("x");
                var width = widthheight[0]
                var height = widthheight[1]
                /* Image resize (thumbnail)*/
                im.resize({
                    srcPath: './Assets/' + request.params.name,
                    dstPath: './Assets/' + size + request.params.name,
                    width: width,
                    height: height
                }, function(err, stdout, stderr) {
                    if (err)
                        throw err;
                    // console.log(stdout)
                    return reply.file('./Assets/' + size + request.params.name);
                }); //resize
            }
            else {
                return reply.file('./Assets/' + request.params.name);            }
        }

    }
]);
server.route(routes)
// register PlugIn's and Start the server.
server.register(plugIns, function (err) {
    // something bad happened loading the plugin.
    if (err) {
        throw err;
    }
    // start server after all PlugIns registration.
    server.start(function (err) {
        if (err) {
            console.log('\x1b[31m', "+++ Error starting server +++");
            throw err;
        } else {
            /*Utils.universalfunctions.getOffsetViaLatLong([51.507351, -0.127758], function (err, result) {
                console.log("getOffsetViaLatLong", err, result);
            })*/
            console.log('\x1b[32m', '+++ SERVER STARTED +++\r\nServer running ');
        }
        ;
    });
});

  Utils.universalfunctions.bootstrapAdmin(function (err, message) {
     if (err) {
     console.log('Error while bootstrapping admin : ' + err)
     } else {
     console.log("Skill successfully");
     }
 });

/* -----  DB connections section.  -----*/
// Connect to MongoDB section.
// DB options.
const Db_Options = {
    db: {native_parser: true},
    server: {poolSize: 5},
    user: db.username,
    pass: db.password
};
// Build the connection string.
const mongoUrl ='mongodb://anurag:123456@ds127888.mlab.com:27888/library3'; //
//const mongoUrl ='mongodb://' + db.host + ':' + db.port + '/' + db.name;

// create DB connection.
mongoose.connect(mongoUrl, Db_Options, function (err) {
    if (err) {
        console.log('\x1b[31m', "DB Error: " + err);
        process.exit(1);
    } else {
        //scheduler.daily_scheduler();            //starting the CRON(scheduler)
        console.log('\x1b[32m', 'MongoDB Connected :' + mongoUrl);
    }
});
