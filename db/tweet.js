const Bookshelf = require('./bookshelf.js')

require('./user.js');
const Tweet = Bookshelf.Model.extend({
  tableName: 'tweets',
  user_id: function() {
    return this.belongsTo('User');
  }
});

module.exports = Bookshelf.model('Tweet', Tweet);