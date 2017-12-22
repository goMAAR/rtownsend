const redis = require('redis');
Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient();

client.on('connect', () => {
  console.log('connected to redis');
})

module.exports = client;