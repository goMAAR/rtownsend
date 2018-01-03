const Usermetric = require('../../db/usermetric.js');
const Tweet = require('../../db/tweet.js');
const Favorite = require('../../db/favorite.js');
const User = require('../../db/user.js');

module.exports = {

  destroyFavorite: (tweetId, favoriterId) => {
    return new Favorite({tweet_id: tweetId, favoriter_id: favoriterId}).fetch()
    .then(favorite => {
      return new Favorite({id: favorite.id})
      .destroy()
      .then(result => {
      })
      .catch(err => {
        console.log(err);
      });
      done();
    });
  },

  createFavorite: (tweetId, favoriterId, favoritedId) => {
    return new Favorite({tweet_id: tweetId, favoriter_id: favoriterId, favorited_id: favoritedId})
    .save()
  },

  checkIfBot: favoritedId => {
    return new User({id: favoritedId})
    .fetch()
  },

  fetchFavoriterMetrics: favoriterId => {
    return new Usermetric({user_id: favoriterId})
    .fetch()
  },

  updateFavoriterMetrics: (totalFavorites, botFavorites, userFavorites, ber) => {
    return new Usermetric({total_favorites: totalFavorites, bot_favorites: botFavorites, user_favorites: userFavorites, bot_engagement_ratio: ber})
    .save()
  },

  fetchTweet: tweetId => {
    return new Tweet({id: tweetId})
    .fetch()
  },

  updateTweetFavoriteCount: (tweetId, tweetFavoritesCount) => {
    return new Tweet({id: tweetId, favorites_count: tweetFavoritesCount})
    .save()
  }

};