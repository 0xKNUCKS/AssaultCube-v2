'use strict';
const express = require('express');
const router = express.Router();
const generateID = require("../utils/generateRandomID")
const redisClient = require("../shared/redisClient")
const sockets = require('socket.io')


// handle POST reqests
router.post('/', (req, res) => {
    const {username, password} = req.body;

    redisClient.hGet("users", username).then((userData) => {
        if (userData) {
            userData = JSON.parse(userData)

            if (userData.hasOwnProperty("session")) {
                return res.status(200 /*OK*/).set({
                    'Content-Type': 'application/json'
                }).send({
                    message: "Session retrieved successfully",
                    data: {
                        session: userData["session"]
                    }
                })
            }
            else {
                return res.status(404 /*Not Found*/).set({
                    'Content-Type': 'application/json'
                }).send({
                    message: "User does not have a session!",
                    data: {
                        session: null
                    }
                })
            }
        }
        else {
            return res.status(401 /*Unauthorized*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "User Not Registered!",
                data: {
                    session: null
                }
            });
        }
    })
})

router.get('/:sessionId', (req, res) => {
    const {sessionId} = req.params;

    console.log(sessionId)

    res.send(sessionId);
})

router.post('/create', (req, res) => {
    console.log(`[${req.ip}] Recieved POST request: `);

    const {username, password} = req.body;

    const sessionID = generateID(username, 32)

    // TODO: user an actual DB for the users, like SQL
    // check if the user is registered
    redisClient.hGet("users", username).then((userData) => {
        if (userData) {
            userData = JSON.parse(userData)

            // if the user dosent have a session property in its data, create one for it
            if (!userData.hasOwnProperty("session")) {
                userData["session"] = sessionID;
                redisClient.hSet("users", username, JSON.stringify(userData)).then(() => {console.log(`Added session property for user ${username}`)});
            }

            // Check if the session already exists
            redisClient.hExists("sessions", userData["session"]).then((sessionExists) => {
                if (!sessionExists) {
                    console.log(`[REDIS] creating a new session\n\t> User: ${username}\n\t> Session: ${sessionID}`)

                    //TODO: use: redisClient.json.set
                    redisClient.hSet("sessions", sessionID, JSON.stringify({
                        owner: username
                    })).then(() => {console.log("Session Created!")})
        
                    return res.status(201 /*Created*/).set({
                        'Content-Type': 'application/json',
                    }).send({
                        message: "Created a session succesfully!",
                        data: {
                            session: sessionID
                        }
                    })
                }
                else {
                    return res.status(409 /*Conflict error*/).set({
                        'Content-Type': 'application/json'
                    }).send({
                        message: "a session already exists! cannot create another one",
                        data: {
                            session: sessionID
                        }
                    });
                }
            })

        }
        else {
            return res.status(401 /*Unauthorized*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "User Not Registered!",
                data: {
                    session: null
                }
            });
        }
    })
})

module.exports = router;
