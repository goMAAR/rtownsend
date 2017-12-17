const knex = require('knex')(require('./knexfile.js'));

const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('registry');

module.exports = bookshelf;