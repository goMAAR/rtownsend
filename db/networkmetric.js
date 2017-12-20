const Bookshelf = require('./bookshelf.js')

require('./network.js');
const Networkmetric = Bookshelf.Model.extend({
  tableName: 'networkmetrics',
  hasTimestamps: true,
  networks: function() {
    return this.belongsTo('Network');
  }
});

module.exports = Bookshelf.model('Networkmetric', Networkmetric);