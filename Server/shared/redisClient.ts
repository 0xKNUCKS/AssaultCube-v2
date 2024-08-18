import * as redisModule from 'redis';

// create a redis client
const redisClient: redisModule.RedisClientType = redisModule.createClient();

redisClient.on('error', (err: redisModule.ErrorReply) => { console.log(`[REDIS] Client Error: ${err.message}`) });
redisClient.on('connect', () => { console.log(`[REDIS] Connected to Redis DB server`); });

redisClient.connect();

export default redisClient;
