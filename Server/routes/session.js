'use strict';
const express = require('express');
const router = express.Router();
const generateID = require("../utils/generateRandomID")
const redisClient = require("../shared/redisClient")
const sockets = require('socket.io')


// handle POST reqests
router.post('/', (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400 /*Bad Request*/).set({
            'Content-Type': 'application/json',
        }).send({
            message: "Username and password are required!"
        })
    }

    redisClient.hGet("users", username).then((userData) => {
        if (!userData) {
            return res.status(401 /*Unauthorized*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "User Not Registered!",
                data: {
                    session: null
                }
            });
        }

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
    })
})

router.get('/:sessionId', (req, res) => {
    const {sessionId} = req.params;

    console.log(sessionId)

    res.send(sessionId);
})

router.post('/create', (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400 /*Bad Request*/).set({
            'Content-Type': 'application/json',
        }).send({
            message: "Username and password are required!"
        })
    }

    const sessionID = generateID(username, 32)

    // TODO: user an actual DB for the users, like SQL
    // check if the user is registered
    redisClient.hGet("users", username).then((data) => {
        if (!data) {
            return res.status(401 /*Unauthorized*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "User Not Registered!",
                data: {
                    session: null
                }
            });
        }

        let userData = JSON.parse(data)

        // if the user dosent have a session property in its data, create one for it
        if (!userData.hasOwnProperty("session")) {
            userData["session"] = sessionID;
            redisClient.hSet("users", username, JSON.stringify(userData)).then(() => {console.log(`Added session property for user ${username}`)});
        }

        // Check if the session already exists
        redisClient.hExists("sessions", userData["session"]).then((sessionExists) => {
            if (!sessionExists) {
                return res.status(409 /*Conflict error*/).set({
                    'Content-Type': 'application/json'
                }).send({
                    message: "a session already exists! cannot create another one",
                    data: {
                        session: sessionID
                    }
                });
            }

            // the user dosent already have a session, so create one for him.
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
        })

    })
})

module.exports = router;
