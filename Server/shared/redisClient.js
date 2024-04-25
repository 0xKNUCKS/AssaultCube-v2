const redis = require("redis")

// create a redis client
const redisClient = redis.createClient();

redisClient.on('error', err => console.log(`[REDIS] Client Error:\t${err}`));
redisClient.on('connect', () => { console.log(`[REDIS] Connected to Redis DB server`); });

redisClient.connect()

module.exports = redisClient;
