/*===================DEPENDENCIES===================*/

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
const newTweetQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/newTweet';

const sqs = new AWS.SQS();

const Usermetric = require('../../db/usermetric.js');
const Tweet = require('../../db/tweet.js');

/*=======================================================*/

/* Constants for manually posting to queue */

const exampleTweet = {
  id: 100000002,
  user_id: 900,
  timestamp: '2017-12-15 22:02:52.056-08',
  text: 'Today made me realize critically acclaimed foreign films are stupid'
};

const params = {
  MessageBody: JSON.stringify(exampleTweet),
  QueueUrl: newTweetQueueUrl,
  DelaySeconds: 0
};

/* bank of words used to calculated TEI */

const extremeTEIWords = {
  'stupid': -0.75,
  'awful': -0.75,
  'hate': -1,
  'amazing': 0.75,
  'awesome': 0.75,
  'love': 1
};

/*=======================EXPORTS=======================*/

module.exports = {
  postTweet: cb => {
      sqs.sendMessage(params, (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }
    });
  },

  tweetApp: Consumer.create({
    queueUrl: newTweetQueueUrl,
    handleMessage: (message, done) => {
      let TEI, teiSum, tweetCount, cei;
      // calculate tweet extremity index
      body = JSON.parse(message.Body);
      for (word in extremeTEIWords) {
        if (body.text.includes(word)) {
          TEI = extremeTEIWords[word];
        } else {
          TEI = 0;
        }
      }
      // insert tweet into database
      new Tweet({id: body.id, user_id: body.user_id, text: body.text, tweet_extremity_index: TEI})
      .save(null, {method: 'insert'})
      .then(tweet => {
        console.log('successfully saved new tweet');
        // find user id in metrics
        new Usermetric({user_id: tweet.attributes.user_id}).fetch()
        // update tweet-related metrics
        .then(usermetric => {
          teiSum = usermetric.attributes.tei_sum + TEI;
          tweetCount = usermetric.attributes.tweet_count + 1;
          cei = teiSum/tweetCount;
          return new Usermetric({tei_sum: teiSum, tweet_count: tweetCount, content_extremity_index: cei})
          .save()
          .then(updatedMetric => {
            console.log('successfully updated metrics');
          })
        })
      })
      .catch(err => {
        console.log(err);
      });
      // remove tweet from queue
      done();
    }
  })

};

