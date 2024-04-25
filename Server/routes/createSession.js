'use strict';
const express = require('express');
const router = express.Router();
const generateID = require("../utils/generateRandomID")
const redisClient = require("../shared/redisClient")

// handle POST requests
router.post('/', (req, res) => {
    console.log(`[${req.ip}] Recieved POST request: `);

    const userKey = `user:${req.ip}`
    const sessionID = generateID(userKey, 32)

    redisClient.exists(userKey).then(exists => {
        console.log(exists)
        if (!exists) {
            console.log(`[REDIS] creating a new session\n\t> User: ${userKey}\n\t> Session: ${sessionID}`)

            //TODO: use: redisClient.json.set
            redisClient.set(userKey, JSON.stringify({
                session: sessionID
            })).then(() => {console.log("Session created!")})

            res.status(201 /*Created*/).set({
                'Content-Type': 'application/json',
            }).send({
                message: "Created a session succesfully!",
                data: {
                    session: sessionID
                }
            })
        }
        else { // user already has a session
            res.status(409 /*Conflict error*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "Cannot create another session! a session already exists for this user.",
                data: {
                    session: sessionID
                }
            });
        }
    })

    console.log(sessionID)
})

module.exports = router;
