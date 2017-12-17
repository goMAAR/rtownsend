const Bookshelf = require('./bookshelf.js')

require('./network.js');
const Networkmetric = Bookshelf.Model.extend({
  tableName: 'networkmetrics',
  timestamps: true,
  networks: function() {
    return this.belongsTo('Network');
  }
});

module.exports = Bookshelf.model('Networkmetric', Networkmetric);