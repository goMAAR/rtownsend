const Bookshelf = require('./bookshelf.js')

require('./user.js');
const Usermetric = Bookshelf.Model.extend({
  tableName: 'usermetrics',
  timestamps: true,
  users: function() {
    return this.belongsTo('User');
  }
});

module.exports = Bookshelf.model('Usermetric', Usermetric);