const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const redisClient = redis.createClient();

// Promisify some methods of redis for better usage. (ass, do them later)
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const existsAsync = promisify(redisClient.exists).bind(redisClient);

module.exports = redisClient;
