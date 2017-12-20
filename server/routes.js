const router = require('express').Router();
const _ = require('underscore');
const Promise = require('bluebird');
const bodyParser = require('body-parser');

const Tweet = require('../db/tweet.js');
const User = require('../db/user.js');
const Dailyengagement = require('../db/dailyengagement.js');
const Favorite = require('../db/favorite.js');
const Hourlyengagement = require('../db/hourlyengagement.js');
const Network = require('../db/network.js');
const Networkmetric = require('../db/networkmetric.js');
const Usermetric = require('../db/usermetric.js');

/*===========================SQS SETUP===========================*/

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');

const newTweetQueueUrl = 'https://sqs.us-east-2.amazonaws.com/202319733273/newTweets';

AWS.config.loadFromPath(__dirname + '/config.json');

/*===================UNCOMMENT TO MANUALLY SEND TWEET TO QUEUE===================*/
// const exampleTweet = {
//   id: 60000,
//   user_id: 3456,
//   timestamp: '2017-12-15 22:02:52.056-08',
//   text: 'Today made me realize critically acclaimed foreign films are stupid'
// };

// const sqs = new AWS.SQS();
// router.get('/send', (req, res) => {
//   let params = {
//     MessageBody: JSON.stringify(exampleTweet),
//     QueueUrl: newTweetQueueUrl,
//     DelaySeconds: 0
//   };

//   sqs.sendMessage(params, (err, data) => {
//     if (err) {
//       res.send(err);
//     } else {
//       res.send(data);
//     }
//   });
// });

/*========================TWEET QUEUE HANDLER========================*/

// bank of "extreme sentiment" words used to calculated TEI
const extremeTEIWords = {
  'stupid': -0.75,
  'awful': -0.75,
  'hate': -1,
  'amazing': 0.75,
  'awesome': 0.75,
  'love': 1
};

const tweetApp = Consumer.create({
  queueUrl: newTweetQueueUrl,
  handleMessage: (message, done) => {
    // calculate tweet extremity index
    let TEI = 0;
    body = JSON.parse(message.Body);
    for (word in extremeTEIWords) {
      if (body.text.includes(word)) {
        TEI = extremeTEIWords[word];
        console.log('result: ', word, TEI);
      }
    }
    // insert tweet into database
    new Tweet({id: body.id, user_id: body.user_id, text: body.text, tweet_extremity_index: TEI})
    .save()
    .then(model => {
      console.log('successfully saved new tweet: ', model.attributes);
    })
    .catch(err => {
      console.log(err);
    });
    // remove tweet from queue
    done();
  }
});

// handle queue errors
tweetApp.on('error', err => {
  console.log(err.message);
});

// start polling queue
tweetApp.start();
// uncomment to stop polling queue
// tweetApp.stop();


// router.get('/receive', (req, res) => {
//   let params = {
//     QueueUrl: queueUrl,
//     VisibilityTimeout: 60
//   };

//   sqs.receiveMessage(params, (err, data) => {
//     if (err) {
//       res.send(err);
//     } else {
//       res.send(data);
//     }
//   });
// });

// router.get('/delete', (req, res) => {
//   let params = {
//     QueueUrl: queueUrl,
//     ReceiptHandle: receipt
//   };

//   sqs.deleteMessage(params, (err, data) => {
//     if (err) {
//       res.send(err);
//     } else {
//       res.send(data);
//     }
//   });
// });


/*==============ROUTES HERE==============*/

/*RECIEVE TWEETS FROM TWEET INVENTORY*/
// Tweets go to cache
// cache comes to route

/* POST /newTweet
  // expected input
  {
    tweet_id: 1000,
    user_id: 6453,
    message: 'a sample tweet',
    timestamp: asdfasdf  
  }
  // output: success/error
*/





module.exports = router;

