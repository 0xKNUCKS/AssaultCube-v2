'use strict';
const express = require('express');
const router = express.Router();
const redisClient = require("../shared/redisClient")

router.get('/', (req, res) => {
    // Give back user info to be then displayed in a "profile" page, not much to give now tho
})

// for now not much is added, the password is pretty much useless ill make up a system for it later and hash it too,
// but for now this is just what we got, basically just a simple username system.

router.post('/register', (req, res) => {
    const {username, password} = req.body;

    redisClient.hExists("users", username).then((userExists) => {
        if (!userExists) {
            redisClient.hSet("users", username, JSON.stringify({
                password: password,
                ip: req.ip
            })).then(() => {console.log(`> Registered New user (${username}:${req.ip})`)})

            return res.status(201 /*Created*/).set({
                'Content-Type': 'application/json',
            }).send({
                message: "User Registered succesfully!",
            })
        }
    })
})

module.exports = router;
