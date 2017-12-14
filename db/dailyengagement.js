const Bookshelf = require('./bookshelf.js');

const Dailyengagement = Bookshelf.Model.extend({
  tableName: 'dailyengagements'
});

module.exports = Bookshelf.model('Dailyengagement', Dailyengagement);
