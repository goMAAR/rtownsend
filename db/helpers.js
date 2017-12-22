const redis = require('./redis/index.js');
const Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

module.exports = {

  randomNumber: upperRange => {
    return Math.floor(Math.random() * upperRange);
  },

  getRedisKeys: (cb) => {
    redis.keys('*', (err, res) => {
      if (err) {
        return console.log(err);
      } else {
        return res;
      }
    });
    cb(records, cb);
  },

  updateRedisNetworks: (records, cb) => {
    console.log('records: ', records);
    let networkUpdates = [];
    records.forEach(key => {
      redis.hgetall(key, (err, obj) => {
        if (err) {
          return console.log(err);
        }
        networkUpdates.push(obj);
      });
    });
    cb(networkUpdates);
  }

};
