'use strict';
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const registerRoutes = require("./helpers/registerRoutes")
const server = require("http").Server(app);
const webSocket = require("ws")
const url = require('node:url')
const queryString = require('node:querystring')
const redisClient = require('./shared/redisClient')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

registerRoutes(app, "./routes", "api/v1");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function () {
    console.log('[SERVER] Express & Sockets server listening on port ' + server.address().port);
});

// Listen for socket connections from our epxress server
const wsServer = new webSocket.Server({server, path: "/api/v1/session/listen"})

wsServer.on('connection', (socket, req) => {
    const socketID = `${req.socket.remoteAddress}:${req.socket.remotePort}`
    console.log(`\n> A new connection established (ip:port):\n\t${socketID}\n`);

    const socketParams = queryString.parse(url.parse(req.url).query)
    const socketSessionID = socketParams["id"]
    const socketTokenID = socketParams["token"]
    if (!socketTokenID || !socketSessionID) {
        return socket.close(4000, "Session and Token are required to continue!")
    }

    //     redisClient.hExists("users", username).then((userExists) => {

    redisClient.hExists("sessions", socketSessionID).then((sessionExists) => {
        if (!sessionExists) {
            return socket.close(4001, "Session Provided is invalid");
        }

        redisClient.hGet("sessions", socketSessionID).then((data) => {
            let sessionData = JSON.parse(data);
            let sessionOwner = sessionData["owner"];

            redisClient.hGet("users", sessionOwner).then((user) => {
                let userData = JSON.parse(user);
                
                const userTokenID = userData["token"]["key"]
                const userTokenExpiryDate = new Date(userData["token"]["expiry"])
                const timeStamp = new Date()
        
                // check the size of the token & if its the same one the user has.
                if (userTokenID.length != 32 || userTokenID != socketTokenID) {
                    return socket.close(4000, "Token provided is invalid!")
                }
        
                // check if the token expiry time has passed today
                if (userTokenExpiryDate.getTime() < timeStamp.getTime()) {
                    return socket.close(4000, "Token provided is expired!")
                }

                console.log(`> Socket "${socketID}":\n\tsuccessfully logged in as "${sessionOwner}"\n`)
            })
        })
    })
    
    socket.on('message', (message) => {
        console.log(`Recieved Message: ${message}`);

        

        socket.send(`You fr said ${message}? how typical smh.`)
    })

    socket.on('close', (code, reasonBuffer) => {
        console.log(`'close' has been called!\n\tCode: ${code}\n\treason: ${reasonBuffer}`)
    })

    socket.on('error', (err) => {
        console.log(`Error Recieved from socket\n\tError: ${err.message}\n${err.stack}`)
    })
})
