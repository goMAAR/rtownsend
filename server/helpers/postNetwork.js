/*===================DEPENDENCIES===================*/

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
const networkQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/networkPost';

const networkPost = new AWS.SQS();

const redis = require('../../db/redis/index.js');
const Promise = require('bluebird');

const networkStatQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/networkStat';

/*====================================================*/

let newNetworks = [];

/*=======================EXPORTS=======================*/

module.exports = {

  submitRecentNetworks: cb => {
    redis.keysAsync('*')
    .then(keys => {
      console.log(`successfully feched ${keys.length} keys`);
      // add the object at each key to newNetworks array
      return Promise.each(keys, key => {
        return redis.hgetallAsync(key)
        .then(obj => {
          newNetworks.push(obj);
        });
      })
      .then(result => {
        console.log('successfully compiled networks batch');
        // submit newNetworks array to Social Network Processing queue
        let params = {
          MessageBody: JSON.stringify({network: newNetworks}),
          QueueUrl: networkStatQueueUrl,
          DelaySeconds: 0
        };
        networkPost.sendMessage(params, (err, data) => {
          if (err) {
            cb(err);
          } else {
            console.log('successfully posted networks batch');
            cb(null, data);
          }
        });
        // flush redis cache
        redis.flushdbAsync()
        .then(result => {
          console.log('successfully flushed redis cache');
        })
      });
    })
    .catch(err => {
      console.log(err);
    });
  }
}