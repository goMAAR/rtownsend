const Bookshelf = require('./bookshelf.js')

require('./tweet.js');
const User = Bookshelf.Model.extend({
  tableName: 'users',
  user_id: function() {
    return this.hasMany('Tweet');
  }
});

module.exports = Bookshelf.model('User', User);