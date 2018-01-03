const Bookshelf = require('./bookshelf.js')

require('./tweet.js');
require('./user.js');

const Favorite = Bookshelf.Model.extend({
  tableName: 'favorites',
  hasTimestamps: true,
  tweets: function() {
    return this.belongsTo('Tweet');
  },
  users: function() {
    return this.belongsTo('User');
  }
});

module.exports = Bookshelf.model('Favorite', Favorite);