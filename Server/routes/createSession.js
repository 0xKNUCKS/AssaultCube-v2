'use strict';
const express = require('express');
const router = express.Router();
const generateID = require("../utils/generateRandomID")
const redisClient = require("redis").createClient() //require("../shared/redisClient")

// redis is giving me headaches, temporary solution until i properly implement redis.
let sessions = new Map();

// handle POST requests
router.post('/', (req, res) => {
    console.log(`[${req.ip}] Recieved POST request: `);

    const userKey = `user:${req.ip}`
    const sessionID = generateID(userKey, 32)

    //redisClient.exists(userKey).then((exists) => {
    //    if (exists) {
    //        console.log("User Exists!")
    //    } else {
    //        console.log("User does not Exist!")
    //        redisClient.set(userKey, JSON.stringify({session: sessionID})).then(() => {console.log("User Added!")})
    //    }
    //})

    const userExists = sessions.has(userKey)

    if (userExists) {
        console.log("user exists!")
        res.status(409 /*Conflict error*/).set({
            'Content-Type': 'text/plain'
        }).send("This user already has a session. Cannot create another one!");
    } else {
        console.log("created a session!")
        sessions.set(userKey, sessionID);
        res.status(200).set({
            'Content-Type': 'text/plain',
        }).send(sessionID)
    }
    console.log(sessionID)
})

module.exports = router;
