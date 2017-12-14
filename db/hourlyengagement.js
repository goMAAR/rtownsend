const Bookshelf = require('./bookshelf.js');

const Hourlyengagement = Bookshelf.Model.extend({
  tableName: 'hourlyengagements',
});

module.exports = Bookshelf.model('Hourlyengagement', Hourlyengagement);
