'use strict';
import * as expressModule from 'express'
import redisClient from '../shared/redisClient'
import bcrypt from 'bcrypt'
import generateRandomID from '../utils/generateRandomID'
import User from '../interfaces/userData';

const router = expressModule.Router();

router.get('/', (req, res) => {
    // Give back user info to be then displayed in a "profile" page, not much to give now tho
})

router.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400 /*Bad Request*/).set({
            'Content-Type': 'application/json',
        }).send({
            message: "Username and password are required to register!"
        })
    }

    const timeStamp = new Date();

    redisClient.hExists("users", username).then((userExists) => {
        if (userExists) {
            return res.status(409 /*Conflict*/).set({
                'Content-Type': 'application/json',
            }).send({
                message: "Username Already exists! try using another one"
            })
        }

        bcrypt.hash(password, 11).then((hashedPassword) => {
            redisClient.hSet("users", username, new User(
                hashedPassword,
                req.ip || "",
                null, // token
                null, // session
                { // timestamps
                    created: timeStamp.toISOString(),
                    last_login: timeStamp.toISOString()
                }).toJSON()
            ).then(() => { console.log(`> Registered New user (${username}:${req.ip})`) })
        })

        return res.status(201 /*Created*/).set({
            'Content-Type': 'application/json',
        }).send({
            message: "User Registered succesfully!"
        })
    })
})

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400 /*Bad Request*/).set({
            'Content-Type': 'application/json',
        }).send({
            message: "Username and password are required!",
            data: {
                token: null
            }
        })
    }

    const timeStamp = new Date();

    redisClient.hExists("users", username).then((userExists) => {
        if (!userExists) {
            return res.status(404 /*Not Found*/).set({
                'Content-Type': 'application/json'
            }).send({
                message: "Username or password is invalid!" // i dont know why websites always mislead with the "incorrect username OR password", but ill do it too. :D
            })
        }

        redisClient.hGet("users", username).then((data) => {
            let userData: User = User.fromJSON(data || "")
            bcrypt.compare(password, userData["password"]).then((result) => {
                if (result) { // passed!
                    // generate a temporary token valid for 24hrs used to validate actions in the API.
                    const tokenId = generateRandomID(req.ip + username, 32)
                    const tokenExpiryDate = new Date(new Date().setDate(timeStamp.getDate() + 1)) // 1 day from now.

                    // Update the last login timestamp & store token
                    userData.timestamps.last_login = timeStamp.toISOString();
                    userData.token = {
                        key: tokenId,
                        expiry: tokenExpiryDate.toISOString()
                    }

                    redisClient.hSet("users", username, userData.toJSON()).then(() => {
                        console.log(`> User successfully logged in [${username} with token ${tokenId}]`)
                    })

                    return res.status(200 /*OK*/).set({
                        'Content-Type': 'application/json'
                    }).send({
                        message: "Success!",
                        data: {
                            token: tokenId
                        }
                    })
                } else { // hate the repetitive code, will be improved later
                    return res.status(404 /*Not Found*/).set({
                        'Content-Type': 'application/json'
                    }).send({
                        message: "Username or password is invalid!",
                        data: {
                            token: null
                        }
                    })
                }
            })
        })
    })
})

export default router;
