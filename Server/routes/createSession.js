'use strict';
const express = require('express');
const router = express.Router();
const generateID = require("../utils/generateRandomID")
const redis = require("redis") //require("../shared/redisClient")

// create a redis client
const redisClient = redis.createClient();

redisClient.on('error', err => console.log(`[REDIS] Client Error:\t${err}`));
redisClient.on('connect', () => { console.log(`[REDIS] Connected to Redis server`); });

redisClient.connect()

// redis is giving me headaches, temporary solution until i properly implement redis.
let sessions = new Map();

// handle POST requests
router.post('/', (req, res) => {
    console.log(`[${req.ip}] Recieved POST request: `);

    const userKey = `user:${req.ip}`
    const sessionID = generateID(userKey, 32)

    redisClient.exists(userKey).then(exists => {
        console.log(exists)
        if (exists) {
            res.status(409 /*Conflict error*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "Cannot create another session! a session already exists for this user.",
                data: {
                    session: sessionID
                }
            });
        }
        else {
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
    })

    console.log(sessionID)
})

module.exports = router;
