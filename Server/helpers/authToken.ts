const redisClient = require("../shared/redisClient")

// TODO: use JWT

module.exports = (req, res, next) => {
    const {username, token} = req.body;

    if (!username || !token) {
        return res.status(400 /*Bad Request*/).set({
            'Content-Type': 'application/json',
        }).send({
            message: "Username and token are required to continue!"
        })
    }

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

        const userToken = userData["token"]
        const userTokenExpiryDate = new Date(userToken["expiry"])
        const timeStamp = new Date()

        // check the size of the token & if its the same one the user has.
        if (token.length != 32 || userToken["key"] != token) {
            return res.status(400 /* Bad Request */).set({
                'Content-Type': 'application/json'
            }).send({
                message: "Token provided is invalid",
                data: {
                    session: null
                }
            });
        }

        // check if the token expiry time has passed today
        if (userTokenExpiryDate.getTime() < timeStamp.getTime()) {
            return res.status(401 /* Unauthorized */).set({
                'Content-Type': 'application/json'
            }).send({
                message: "Token provided has expired",
                data: {
                    session: null
                }
            });
        }

        // Success!
        next();
    })
}