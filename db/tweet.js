const Bookshelf = require('./bookshelf.js')

require('./user.js');
require('./favorite.js');
const Tweet = Bookshelf.Model.extend({
  tableName: 'tweets',
  users: function() {
    return this.belongsTo('User');
  },
  favorites: function() {
    return this.hasMany('Favorite');
  }
});

module.exports = Bookshelf.model('Tweet', Tweet);