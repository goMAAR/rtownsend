/*===================DEPENDENCIES===================*/

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
const newFavoriteQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/newFavorite';

const sqs = new AWS.SQS();

const Usermetric = require('../../db/usermetric.js');
const Tweet = require('../../db/tweet.js');
const Favorite = require('../../db/favorite.js');
const User = require('../../db/user.js');


/*=======================================================*/

/* Constants for manually posting to queue */

const exampleFavorite = {
  tweet_id: 12345,
  favoriter_id: 50000,
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

/*=======================EXPORTS=======================*/

module.exports = {
  postFavorite: cb => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }
    });
  },

  // note that this does not yet cascade favorite destruction

  favoriteApp: Consumer.create({
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
  })

};