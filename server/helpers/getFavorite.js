/*===================DEPENDENCIES===================*/
// const AWSconfig = require('./config.js');
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');

/* Toggle comment to disable manual SQS posting */
AWS.config.loadFromPath(__dirname + '/config.json');


/*=================Fake_SQS Instructions=================*/

// Run in command line
// fake_sqs -p 3000
// curl http://localhost:3000 -d "Action=CreateQueue&QueueName=newFavorite&AWSAccessKeyId=accessKey"
// curl http://localhost:3000/newFavorite -d "Action=SendMessage&QueueUrl=http://localhost:3000/newFavorite&MessageBody='stuff'&AWSAccessKeyId=access%20key%20id"
// curl http://localhost:3000/newFavorite -d "Action=ReceiveMessage&QueueUrl=http://localhost:3000/newFavorite&AWSAccessKeyId=access%20key%20id"

const newFavoriteQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/newFavorite';
const fakeNewFavoriteQueueUrl = "http://localhost:3000/newFavorite";

const sqs = new AWS.SQS();

const utils = require('../../db/helpers/favorite.js');

const Usermetric = require('../../db/usermetric.js');
const Tweet = require('../../db/tweet.js');
const Favorite = require('../../db/favorite.js');
const User = require('../../db/user.js');


/*=======================================================*/

/* Constants for manually posting to queue */

const exampleFavorite = {
  tweet_id: 12347,
  favoriter_id: 400,
  favorited_id: 27325,
  created_at: '2017-12-15 22:02:52.056-08',
  destroy: false
  // destroy: true
};

const params = {
  MessageBody: JSON.stringify(exampleFavorite),
  QueueUrl: newFavoriteQueueUrl,
  DelaySeconds: 0
};

const paramsFake = {
  MessageBody: JSON.stringify(exampleFavorite),
  QueueUrl: fakeNewFavoriteQueueUrl,
  DelaySeconds: 0
}

/* Variables for database transactions*/

let bot, favoriter, tweetId, tweetFavoritesCount, favorited, totalFavorites, botFavorites, userFavorites, ber;

/*=======================EXPORTS=======================*/

module.exports = {

  // call this function to manually add a favorite to the queue
  postFavorite: cb => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }
    });
  },

  // call this function to manually add a favorite to the fake queue
  postFavoriteFake: cb => {
    sqs.sendMessage(paramsFake, (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }     
    });
  },

  // note that this does not yet cascade favorite destruction

  // call this funtion to work on favorites in the queue
  favoriteApp: Consumer.create({
    queueUrl: newFavoriteQueueUrl,
    handleMessage: (message, done) => {
      let body = JSON.parse(message.Body);
      tweetId = body.tweet_id;
      favoriterId = body.favoriter_id;
      favoritedId = body.favorited_id;

      if (body.destroy) {
        utils.destroyFavorite(tweetId, favoriterId);

      } else {
        utils.createFavorite(tweetId, favoriterId, favoritedId)

        .then(favorite => {
          console.log('successfully saved new favorite');
          utils.checkIfBot(favoritedId)

          .then(favoritedUser => {
            bot = favoritedUser.attributes.bot_account;
          })

          .then(result => {
            utils.fetchFavoriterMetrics(favoriterId)

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
              utils.updateFavoriterMetrics(totalFavorites, botFavorites, userFavorites, ber)
            })

            .then(updatedMetric => {
              console.log('successfully updated favoriter metrics');
              utils.fetchTweet(tweetId)

              .then(tweet => {
                tweetFavoritesCount = tweet.attributes.favorites_count + 1;
                utils.updateTweetFavoriteCount(tweetId, tweetFavoritesCount)

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
  }),

  // call this funtion to work on favorites in the fake queue
  fakeFavoriteApp: Consumer.create({
    queueUrl: fakeNewFavoriteQueueUrl,
    handleMessage: (message, done) => {
      console.log('in fake favorite app');
      let body = JSON.parse(message.Body);
      tweetId = body.tweet_id;
      favoriterId = body.favoriter_id;
      favoritedId = body.favorited_id;

      if (body.destroy) {
        utils.destroyFavorite(tweetId, favoriterId);

      } else {
        utils.createFavorite(tweetId, favoriterId, favoritedId)

        .then(favorite => {
          console.log('successfully saved new favorite');
          utils.checkIfBot(favoritedId)

          .then(favoritedUser => {
            bot = favoritedUser.attributes.bot_account;
          })

          .then(result => {
            utils.fetchFavoriterMetrics(favoriterId)

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
              utils.updateFavoriterMetrics(totalFavorites, botFavorites, userFavorites, ber)
            })

            .then(updatedMetric => {
              console.log('successfully updated favoriter metrics');
              utils.fetchTweet(tweetId)

              .then(tweet => {
                tweetFavoritesCount = tweet.attributes.favorites_count + 1;
                utils.updateTweetFavoriteCount(tweetId, tweetFavoritesCount)

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
  })

};