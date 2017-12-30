/*===================DEPENDENCIES===================*/
const getNetwork = require('./helpers/getNetwork.js');

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

const networkPost = new AWS.SQS();

router.get('/network', (req, res) => {
  console.log('Executing updateNetworkMetrics job 2/2...');

  let newNetworks = [];

  // get an array of all keys in redis cache
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
          res.send(err);
        } else {
          console.log('successfully posted networks batch');
          res.send(data);
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

});

/*===================UNCOMMENT TO MANUALLY SEND TWEET TO QUEUE===================*/
/*this section and all subsequent manual queuing code will be removed prior to finalization*/

// const exampleTweet = {
//   id: 60001,
//   user_id: 900,
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
});

// handle queue errors
tweetApp.on('error', err => {
  console.log(err.message);
});

// start polling queue
// tweetApp.start();
// uncomment to stop polling queue
tweetApp.stop();

/*===================UNCOMMENT TO MANUALLY SEND FAVORITE TO QUEUE===================*/
// const exampleFavorite = {
//   tweet_id: 12345,
//   favoriter_id: 50000,
//   favorited_id: 27325,
//   created_at: '2017-12-15 22:02:52.056-08',
//   // destroy: false
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

// note that this does not yet cascade favorite destruction

// need to also update the hour's ber 

const favoriteApp = Consumer.create({
  queueUrl: newFavoriteQueueUrl,
  handleMessage: (message, done) => {
    let body = JSON.parse(message.Body);
    let bot, favoriter, tweetID, tweetFavoritesCount, favorited, totalFavorites, botFavorites, userFavorites, ber;
    tweetID = body.tweet_id;
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
      // create new record and perform associated updates
      new Favorite({tweet_id: body.tweet_id, favoriter_id: body.favoriter_id, favorited_id: body.favorited_id})
      .save()
      // fetch user record for favorited user
      .then(favorite => {
        console.log('successfully saved new favorite');
        favoriter = favorite.attributes.favoriter_id;
        favorited = favorite.attributes.favorited_id;
        new User({id: favorited}).fetch()
        // determine whether favorited user is a bot account
        .then(favoritedUser => {
          bot = favoritedUser.attributes.bot_account;
        })
        // fetch user metric record for favoriter 
        .then(result => {
          new Usermetric({user_id: favoriter}).fetch()
          // update favorites counts for the favoriter
          .then(favoriterMetric => {
            totalFavorites = favoriterMetric.attributes.total_favorites + 1;
            if (bot) {
              botFavorites = favoriterMetric.attributes.bot_favorites + 1;
              userFavorites = favoriterMetric.attributes.user_favorites;
            } else { 
              userFavorites = favoriterMetric.attributes.user_favorites + 1;
              botFavorites = favoriterMetric.attributes.bot_favorites;
            }
            ber = botFavorites/userFavorites;
            return new Usermetric({total_favorites: totalFavorites, bot_favorites: botFavorites, user_favorites: userFavorites, bot_engagement_ratio: ber})
            .save()
          })
          // find tweet
          .then(updatedMetric => {
            console.log('successfully updated favoriter metrics');
            new Tweet({id: tweetID}).fetch()
            // update favorites count on tweet
            .then(tweet => {
              tweetFavoritesCount = tweet.attributes.favorites_count + 1;
              return new Tweet({id: tweetID, favorites_count: tweetFavoritesCount})
              .save()
              .then(updatedTweet => {
                console.log('successfuly updated tweet');
              });
            });
          });
        });
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
// favoriteApp.start();
// uncomment to stop polling queue
favoriteApp.stop();

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
