'use strict';
import express, { application, Express, NextFunction, Request, RequestHandler, Response, Router } from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import registerRoutes from './helpers/registerRoutes';
import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import webSocketApp from './webSocket/webSocket';
import HttpError from './errors/httpError';

let app: Express = express();

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

// Register all API Routes
registerRoutes(app, "./routes", "api/v1").then(() => {
    // complete everything else only after registering the API routes

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new HttpError({ message: "Not Found", status: 404 });
        next(err);
    });

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    app.set('port', process.env.PORT || 3000);

    // create a new http Server
    const server: HttpServer = new HttpServer(app)
    server.listen(app.get('port'), function () {
        console.log('[SERVER] Express & Sockets server listening on port ' + app.get('port'));
    });

    // Create a webSocket server for our server and load up our app in it
    const wsServer = new WebSocketServer({ server, path: "/api/v1/session/listen" })
    new webSocketApp(wsServer)
})