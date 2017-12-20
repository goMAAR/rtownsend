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
const newFavoriteQueueUrl = 'https://sqs.us-east-2.amazonaws.com/202319733273/newFavorite';
const networkQueueUrl = 'https://sqs.us-east-2.amazonaws.com/202319733273/follow';

AWS.config.loadFromPath(__dirname + '/config.json');

/*===================UNCOMMENT TO MANUALLY SEND TWEET TO QUEUE===================*/
/*this section and all subsequent manual queuing code will be removed prior to finalization*/

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
    .then(tweet => {
      console.log('successfully saved new tweet: ', tweet.attributes);
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

/*===================UNCOMMENT TO MANUALLY SEND FAVORITE TO QUEUE===================*/
// const exampleFavorite = {
//   tweet_id: 12345,
//   favoriter_id: 50000,
//   created_at: '2017-12-15 22:02:52.056-08',
//   destroy: true
// };

// const sqs = new AWS.SQS();
// router.get('/send', (req, res) => {
//   let params = {
//     MessageBody: JSON.stringify(exampleFavorite),
//     QueueUrl: newFavoriteQueueUrl,
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

/*========================FAVORITES QUEUE HANDLER========================*/

const favoriteApp = Consumer.create({
  queueUrl: newFavoriteQueueUrl,
  handleMessage: (message, done) => {
    body = JSON.parse(message.Body);
    if (body.destroy) {
      // delete record
      new Favorite({tweet_id: body.tweet_id, favoriter_id: body.favoriter_id}).fetch()
      .then(favorite => {
        new Favorite({id: favorite.id})
        .destroy()
        .then(result => {
          console.log('successfully destroyed record');
        })
        /* will research more complete error handling for nonexistent records */
        .catch(err => {
          console.log(err);
        });
        done();
      })
    } else {
      // create new record
      new Favorite({tweet_id: body.tweet_id, favoriter_id: body.favoriter_id})
      .save()
      .then(favorite => {
        console.log('successfully saved new favorite: ', favorite.attributes);
      })
      .catch(err => {
        console.log(err);
      });
      done();
    }
  }
});

// handle queue errors
favoriteApp.on('error', err => {
  console.log(err.message);
});

// start polling queue
favoriteApp.start();
// uncomment to stop polling queue
// favoriteApp.stop();

/*===================UNCOMMENT TO MANUALLY SEND NETWORK TO QUEUE===================*/
// const exampleNetwork = {
//   follower_id: 40000,
//   followed_id: 400,
//   created_at: '2017-12-15 22:02:52.056-08',
//   destroy: true
// };

// const sqs = new AWS.SQS();
// router.get('/send', (req, res) => {
//   let params = {
//     MessageBody: JSON.stringify(exampleNetwork),
//     QueueUrl: networkQueueUrl,
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

/*========================NETWORK  QUEUE HANDLER========================*/

const networkApp = Consumer.create({
  queueUrl: networkQueueUrl,
  handleMessage: (message, done) => {
    body = JSON.parse(message.Body);
    if (body.destroy) {
      // delete record
      new Network({follower_id: body.follower_id, followed_id: body.followed_id}).fetch()
      .then(network => {
        new Network({id: network.id})
        .destroy()
        .then(result => {
          console.log('successfully destroyed record');
        })
        /* will research more complete error handling for nonexistent records */
        .catch(err => {
          console.log(err);
        });
        done();
      })
    } else {
      // create new record
      new Network({follower_id: body.follower_id, followed_id: body.followed_id})
      .save()
      .then(network => {
        console.log('successfully saved new network: ', network.attributes);
      })
      .catch(err => {
        console.log(err);
      });
      done();
    }
  }
});

// handle queue errors
networkApp.on('error', err => {
  console.log(err.message);
});

// start polling queue
networkApp.start();
// uncomment to stop polling queue
// networkApp.stop();

/*===========================EXAMPLES OF MANUAL QUEUE HANDLING===========================*/
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

module.exports = router;

