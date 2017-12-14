const Bookshelf = require('./bookshelf.js')

require('./tweet.js');
require('./usermetric.js');
require('./favorite.js');
require('./network.js');
const User = Bookshelf.Model.extend({
  tableName: 'users',
  tweets: function() {
    return this.hasMany('Tweet');
  },
  usermetrics: function() {
    return this.hasOne('Usermetric');
  },
  favorites: function() {
    return this.hasMany('Favorite');
  },
  networks: function() {
    return this.hasMany('Network');
  }
});

module.exports = Bookshelf.model('User', User);