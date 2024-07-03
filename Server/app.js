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
    console.log(`\n> A new connection established (ip:port):\n\t${req.socket.remoteAddress}:${req.socket.remotePort}\n`);

    const socketParams = queryString.parse(url.parse(req.url).query)
    const sessionID = socketParams["id"]
    const tokenID = socketParams["token"]
    if (!sessionID || !tokenID) {
        return socket.close(4000, "Session and Token are required to continue!")
    }

    //     redisClient.hExists("users", username).then((userExists) => {

    redisClient.hExists("sessions", sessionID).then((sessionExists) => {
        if (!sessionExists) {
            return socket.close(4001, "Session Provided is invalid");
        }

        redisClient.hGet("sessions", sessionID).then((data) => {
            let sessionData = JSON.parse(data);
            let sessionOwner = sessionData["owner"];

            redisClient.hGet("users", sessionOwner).then((user) => {
                let userData = JSON.parse(user);
                
                const userToken = userData["token"]
                const userTokenExpiryDate = new Date(userToken["expiry"])
                const timeStamp = new Date()
        
                // check the size of the token & if its the same one the user has.
                if (token.length != 32 || userToken["key"] != token) {
                    return socket.close(4000, "Session and Token are required to continue!")
                }
        
                // check if the token expiry time has passed today
                if (userTokenExpiryDate.getTime() < timeStamp.getTime()) {
                    return socket.close(4000, "Session and Token are required to continue!")
                }
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
