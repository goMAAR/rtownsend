/*===================DEPENDENCIES===================*/
const getNetwork = require('./helpers/getNetwork.js');
const getFavorite = require('./helpers/getFavorite.js');
const getTweet = require('./helpers/getTweet.js');
const postNetwork = require('./helpers/postNetwork.js');

const router = require('express').Router();
const _ = require('underscore');
const Promise = require('bluebird');
const axios = require('axios');

const redis = require('../db/redis/index.js');

const Tweet = require('../db/tweet.js');
const User = require('../db/user.js');
const Currentengagement = require('../db/currentengagement.js');
const Favorite = require('../db/favorite.js');
const Hourlyengagement = require('../db/hourlyengagement.js');
const Network = require('../db/network.js');
const Networkmetric = require('../db/networkmetric.js');
const Usermetric = require('../db/usermetric.js');

/*===========================SQS SETUP===========================*/

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');

//store these in config.json along with keys
const newTweetQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/newTweet';
const newFavoriteQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/newFavorite';
const networkQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/networkPost';
const networkStatQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/networkStat';

// AWS.config.loadFromPath(__dirname + '/config.json');

/*========================CREATE NEW SENTIMENT METRIC=======================*/

/*This route will be hit every hour by an automated worker*/

router.get('/sentiment', (req, res) => {
  //calculate current date and hour
  let date = new Date();
  hour = date.getHours();
  ISOdate = date.toISOString();
  console.log(hour, ISOdate);
  //fetch current record and add to hourly records table
  new Currentengagement().fetchAll()
  .then(record => {
    if (!record.attributes) {
      console.log('no record found');
      new Currentengagement({date: ISOdate, avg_BER: 0, hour: hour, ber_sum: 0, favorites_count: 0})
        .save()
        .then(record => {
          console.log('successfully created new sentiment record');
        })
        .error(err => {
          console.log(err);
        })
        res.sendStatus(200);
    } else {
      console.log('record found with attributes: ', record.attributes);
      new Hourlyengagement({date: record.attributes.date, avg_BER: record.attributes.avg_BER, hour: record.attributes.hour, ber_sum: record.attributes.ber_sum, favorites_count: record.attributes.favorites_count})
      .save()
      // over-write previous current engagement record
      .then(result => {
        console.log('successfully saved result: ', result.attributes);
        new Currentengagement({date: date, avg_BER: 0, hour: hour, ber_sum: 0, favorites_count: 0})
        .save()
        .then(record => {
          console.log('successfully created new sentiment record');
        })
        .error(err => {
          console.log(err);
        })
        res.sendStatus(200);
      })
    }
  })
  // update record in db
});

/*===========================SEND NETWORK METRICS===========================*/

/*This route will be hit every 10 minutes by an automated worker*/

router.get('/network', (req, res) => {
  console.log('Executing updateNetworkMetrics job 2/2...');
  postNetwork.submitRecentNetworks( (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});


/*================TWEET QUEUE HANDLER================*/

/* Uncomment to manually send favorite to queue */
router.get('/postTweet', (req, res) => {
  getTweet.postTweet((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// handle queue errors
getTweet.tweetApp.on('error', err => {
  console.log(err.message);
});

// uncomment to start polling queue
getTweet.tweetApp.start();
// uncomment to stop polling queue
// getTweet.tweetApp.stop();


/*================FAVORITE QUEUE HANDLER================*/

/* Uncomment to manually send favorite to queue */
router.get('/postFavorite', (req, res) => {
  getFavorite.postFavorite((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// handle queue errors
getFavorite.favoriteApp.on('error', err => {
  console.log(err.message);
});

// uncomment to start polling queue
getFavorite.favoriteApp.start();
// uncomment to stop polling queue
// getFavorite.favoriteApp.stop();


/*================NETWORK QUEUE HANDLER================*/

/* Uncomment to manually send network to queue */
router.get('/postNetwork', (req, res) => {
  getNetwork.postNetwork((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// handle queue errors
getNetwork.networkApp.on('error', err => {
  console.log(err.message);
});

/* uncomment to start polling queue */
getNetwork.networkApp.start();
/* uncomment to stop polling queue */
// getNetwork.networkApp.stop();

/*=======================================================*/

module.exports = router;
