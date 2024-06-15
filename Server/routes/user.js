'use strict';
const express = require('express');
const router = express.Router();
const redisClient = require("../shared/redisClient")
const bcrypt = require("bcrypt")

router.get('/', (req, res) => {
    // Give back user info to be then displayed in a "profile" page, not much to give now tho
})

router.post('/register', (req, res) => {
    const {username, password} = req.body;
    const timeStamp = new Date().toISOString();

    redisClient.hExists("users", username).then((userExists) => {
        if (!userExists) {
            bcrypt.hash(password, 11).then((hashedPassword) => {
                redisClient.hSet("users", username, JSON.stringify({
                    password: hashedPassword,
                    ip: req.ip,
                    timestamps: {
                        created: timeStamp,
                        last_login: timeStamp
                    }
                })).then(() => {console.log(`> Registered New user (${username}:${req.ip})`)})
            })

            return res.status(201 /*Created*/).set({
                'Content-Type': 'application/json',
            }).send({
                message: "User Registered succesfully!"
            })
        }
        else {
            return res.status(409 /*Conflict*/).set({
                'Content-Type': 'application/json',
            }).send({
                message: "Username Already exists! try using another one"
            })
        }
    })
})

router.post('/login', (req, res) => {
    const {username, password} = req.body;
    const timeStamp = new Date().toISOString();

    redisClient.hExists("users", username).then((userExists) => {
        if (userExists) {
            redisClient.hGet("users", username).then((data) => {
                let dataObj = JSON.parse(data);

                // Update the last login timestamp
                dataObj["timestamps"]["last_login"] = timeStamp
                redisClient.hSet("users", username, JSON.stringify(dataObj)).then(() => {/* log or something lol */})

                if (dataObj.hasOwnProperty("password")) {
                    bcrypt.compare(password, dataObj["password"]).then((result) => {
                        if (result) {
                            return res.status(200 /*OK*/).set({
                                'Content-Type': 'application/json'
                            }).send({
                                message: "Success!"
                            })
                        } else { // hate the repetitive code, will be improved later
                            return res.status(404 /*Not Found*/).set({
                                'Content-Type': 'application/json'
                            }).send({
                                message: "Username or password is invalid!"
                            })
                        }
                    })
                }
            })
        }
        else {
            return res.status(404 /*Not Found*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "Username or password is invalid!" // i dont know why websites always mislead with the "incorrect username OR password", but ill do it too. :D
            })
        }
    })
})

module.exports = router;
