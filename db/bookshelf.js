const knex = require('knex')(require('./knexfile.js'));

knex.schema.createTableIfNotExists('tweets', function(table) {
  table.integer('id');
  table.integer('user_id').unsigned()
  table.foreign('user_id').references('User.id')
  table.string('message');
  table.float('tweet_extremity_index', 2);
});

knex.schema.createTableIfNotExists('users', function(table) {
  table.integer('id');
  table.datTime('timestamp');
  table.float('content_extremity_index', 2);
  table.float('influencer_ratio', 2);
  table.float('network_extremity_index', 2);
  table.integer('total_favorites');
  table.boolean('bot_account');
  table.integer('follower_count');
  table.integer('following_count');
  table.float('bot_engagement_ratio', 2);
  table.integer('bot_favorites');
  table.integer('user_favorites');
});

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports = bookshelf;