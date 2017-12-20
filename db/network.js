const Bookshelf = require('./bookshelf.js')

require('./user.js');
require('./networkmetric.js');
const Network = Bookshelf.Model.extend({
  tableName: 'networks',
  hasTimestamps: true,
  users: function() {
    return this.belongsTo('User');
  },
  networkmetrics: function() {
    return this.hasOne('Networkmetric');
  }
});


module.exports = Bookshelf.model('Network', Network);