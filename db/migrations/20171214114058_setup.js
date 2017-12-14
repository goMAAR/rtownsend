exports.up = function(knex, Promise) {
  return Promise.all([
    //tweets
    knex.schema.createTableIfNotExists('tweets', function(table) {
      table.integer('id').primary();
      table.integer('user_id');
      table.string('message');
      table.float('tweet_extremity_index', 2);
      //users
    }),

    knex.schema.createTableIfNotExists('users', function(table) {
      table.integer('id').primary();
      table.boolean('bot_account');
      //favorites
    }),

    knex.schema.createTableIfNotExists('favorites', function(table) {
      table.increments('id').primary();
      table.timestamps(true);
      table.integer('tweet_id');
      table.integer('favoriter_id');
      table.integer('favorited_id');
      //networks
    }),

    knex.schema.createTableIfNotExists('networks', function(table) {
      table.increments('id').primary();
      table.timestamps(true);
      table.integer('follower_id');
      table.integer('followed_id');
      //usermetrics
    }),

    knex.schema.createTableIfNotExists('usermetrics', function(table) {
      table.increments('id').primary();
      table.timestamps(true);
      table.integer('user_id');
      table.float('content_extremity_index', 2);
      table.float('influencer_ratio', 2);
      table.float('network_extremity_index', 2);
      table.integer('total_favorites');
      table.integer('bot_favorites');
      table.integer('user_favorites');      
      table.integer('follower_count');
      table.integer('following_count');
      table.float('bot_engagement_ratio', 2);
      //networkmetrics
    }),

    knex.schema.createTableIfNotExists('networkmetrics', function(table) {
      table.increments('id').primary();
      table.timestamps(true);     
      table.integer('network_id').unsigned().references('id').inTable('networks');
      table.float('followed_favorites_ratio', 2);
      //hourlyengagements
    }),

    knex.schema.createTableIfNotExists('hourlyengagements', function(table) {
      table.increments('id').primary();
      table.integer('hour');
      table.float('avg_BER', 2);
      //dailyengagements
    }),

    knex.schema.createTableIfNotExists('dailyengagements', function(table) {
      table.increments('id').primary();
      table.integer('hour_id').unsigned().references('id').inTable('hourlyengagements');
      table.date('date');
      table.float('avg_BER', 2);
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('tweets'),
    knex.schema.dropTable('networks'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('dailyEngagements'),
    knex.schema.dropTable('hourlyEngagements')
  ])
};
