const Bookshelf = require('./bookshelf.js');

const Currentengagement = Bookshelf.Model.extend({
  tableName: 'currentengagements',
});

module.exports = Bookshelf.model('Currentengagement', Currentengagement);

