const Bookshelf = require('./bookshelf.js')

require('./network.js');
const Networkmetric = Bookshelf.Model.extend({
  tableName: 'networkmetrics',
  hasTimestamps: true,
  networks: function() {
    return this.belongsTo('Network');
  }
});

const Networkmetrics = Bookshelf.Collection.extend({
  model: Networkmetric
});

module.exports = {
  Networkmetric: Bookshelf.model('Networkmetric', Networkmetric),
  Networkmetrics: Bookshelf.collection('Networkmetrics', Networkmetrics)
};