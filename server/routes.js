const router = require('express').Router();
const _ = require('underscore');
const Promise = require('bluebird');
const bookshelf = require('../db/bookshelf.js');
const pm = require('bookshelf-pagemaker')(bookshelf);

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

/*modularize this later*/

/*===========================CALCULATE NETWORK METRICS===========================*/

/*super incomplete*/

router.get('/networkMetrics', (req, res) => {
  console.log('Executing updateNetworkMetrics job 2/2...');
  Network.fetchAll()
  .then(networks => {
    console.log(networks);
    res.send(networks);
  })
  .catch(err => {
    console.log(err);
  })

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

/*=======================NETWORK METRICS ROUTE=======================*/



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

let TEI, teiSum, tweetCount, cei;

const tweetApp = Consumer.create({
  queueUrl: newTweetQueueUrl,
  handleMessage: (message, done) => {
    // calculate tweet extremity index
    body = JSON.parse(message.Body);
    for (word in extremeTEIWords) {
      if (body.text.includes(word)) {
        TEI = extremeTEIWords[word];
        console.log('result: ', word, TEI);
      } else {
        TEI = 0;
      }
    }
    // insert tweet into database
    new Tweet({id: body.id, user_id: body.user_id, text: body.text, tweet_extremity_index: TEI})
    .save(null, {method: 'insert'})
    .then(tweet => {
      console.log('successfully saved new tweet: ', tweet.attributes);
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
          console.log('successfully updated metrics: ', updatedMetric.attributes);
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
tweetApp.start();
// uncomment to stop polling queue
// tweetApp.stop();

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
favoriteApp.start();
// uncomment to stop polling queue
// favoriteApp.stop();

/*===================UNCOMMENT TO MANUALLY SEND NETWORK TO QUEUE===================*/
// const exampleNetwork = {
//   follower_id: 40000,
//   followed_id: 400,
//   created_at: '2017-12-15 22:02:52.056-08',
//   // destroy: true
//   destroy: false
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

/*========================NETWORK QUEUE HANDLER========================*/
let followedFollowerCount, followedIR, followedCEI, followerID, followedID, followerFollowingCount, followerIR, followerNEISum, followerNEI;

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
      followerID = body.follower_id;
      followedID = body.followed_id;
      return new Usermetric({user_id: followedID}).fetch()
      // updated user metrics for followed user
      .then(followed => {
        console.log('followed: ', followed.attributes);
        followedFollowerCount = followed.attributes.follower_count + 1;
        followedIR = followed.attributes.following_count/followedFollowerCount;
        followedCEI = followed.attributes.content_extremity_index;
        return new Usermetric({follower_count: followedFollowerCount, influencer_ratio: followedIR})
        .save()
        // update user metrics for follower user
        .then(followedRes => {
          console.log('successfully updated followed record: ', followedRes.attributes);
          new Usermetric({user_id: followerID}).fetch()
          .then(follower => {
            followerFollowingCount = follower.attributes.following_count + 1;
            followerIR = followerFollowingCount/follower.attributes.follower_count;
            followerNEISum = follower.attributes.nei_sum + followedCEI;
            followerNEI = followerNEISum/follower.attributes.following_count;
            return new Usermetric({following_count: followerFollowingCount, influencer_ratio: followerIR, nei_sum: followerNEISum, network_extremity_index: followerNEI})
            .save()
            // add new network
            .then(followerRes => {
              console.log('successfully updated follower record: ', followerRes.attributes);
              new Network({follower_id: body.follower_id, followed_id: body.followed_id, followed_influencer_ratio: followedIR})
              .save()
              .then(network => {
                console.log('successfully saved new network: ', network.attributes);
              })
            })
          })
        })
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

