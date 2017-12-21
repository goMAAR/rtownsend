const Tweet = require('../../db/tweet.js');

const extremeTEIWords = {
  'stupid': -0.75,
  'awful': -0.75,
  'hate': -1,
  'amazing': 0.75,
  'awesome': 0.75,
  'love': 1
};

module.exports = {

  calculateTEI: tweet => {
    for (word in extremeTEIWords) {
      if (tweet.includes(word)) {
        return extremeTEIWords[word];
      }
    }
    return 0;
  },

  createTweet: (id, userId, text, TEI) => {
    console.log('yo');
    return new Tweet({id: id, user_id: userId, text: text, tweet_extremity_index: tei})
    .save()
    .then(tweet => {
      console.log('successfully saved new tweet: ', tweet.attributes);
    })
    .catch(err => {
      console.log(err);
    });
  }

};


