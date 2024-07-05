'use strict';
const express = require('express');
const router = express.Router();
const generateID = require("../utils/generateRandomID")
const redisClient = require("../shared/redisClient")
const authToken = require("../helpers/authToken")

// handle POST reqests
router.post('/', authToken, (req, res) => {
    const {username} = req.body;

    redisClient.hGet("users", username).then((userData) => {
        userData = JSON.parse(userData)
        const userSession = userData["session"]

        if (userSession) {
            return res.status(200 /*OK*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "Session retrieved successfully",
                data: {
                    session: userSession
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

router.post('/create', authToken, (req, res) => {
    const {username} = req.body;
    let sessionID = generateID(username, 32)
    const timeStamp = new Date();

    // check if the user is registered & authed
    redisClient.hGet("users", username).then((data) => {
        let userData = JSON.parse(data)
        
        // check if a user already has a session
        if (userData["session"] != null) {
            sessionID = userData["session"]["key"];
        }

        // Check if the session already exists in the sessions list
        redisClient.hExists("sessions", sessionID).then((sessionExists) => {
            if (sessionExists) {
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

            // store the session in the user
            userData["session"] = {
                key: sessionID,
                created_at: timeStamp.toISOString()
            }
            redisClient.hSet("users", username, JSON.stringify(userData)).then(() => {console.log(`Added session property for user ${username}`)});

            // add the session to the sessions list
            redisClient.hSet("sessions", sessionID, JSON.stringify({
                owner: username,
                created_at: timeStamp.toISOString()
            })).then(() => {console.log("Session Created!")})

            // send back the session ID
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
