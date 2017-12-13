
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('tweets', function(table) {
      table.increments('id');
      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id')
      table.string('message');
      table.float('tweet_extremity_index', 2);
    }),

    knex.schema.createTableIfNotExists('users', function(table) {
      table.increments('id');
      table.dateTime('timestamp');
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
    }),

    knex.schema.createTableIfNotExists('networks', function(table) {
      table.increments('id');
      table.integer('follower_id').unsigned()
      table.foreign('follower_id').references('users.id');
      table.integer('followed_id').unsigned()
      table.foreign('followed_id').references('users.id');
      table.dateTime('timestamp');
    }),

    knex.schema.createTableIfNotExists('dailyEngagements', function(table) {
      table.increments('id');
      table.integer('hour_id').unsigned()
      table.foreign('hour_id').references('hourlyEngagements.id');
      table.date('date');
      table.float('avg_BER', 2);
    }),

    knex.schema.createTableIfNotExists('hourlyEngagements', function(table) {
      table.increments('id');
      table.integer('hour');
      table.float('avg_BER', 2);
    })

  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('tweets'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('networks'),
    knex.schema.dropTable('dailyEngagements'),
    knex.schema.dropTable('hourlyEngagements')
  ])
};
