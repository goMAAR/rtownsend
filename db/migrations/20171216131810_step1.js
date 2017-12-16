exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTableIfNotExists('tweets', function(table) {
      table.integer('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.string('text');
      table.float('tweet_extremity_index', 2);
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('dailyengagements'),
    knex.schema.dropTable('networkmetrics'),
    knex.schema.dropTable('networks'),
    knex.schema.dropTable('hourlyengagements'),
    knex.schema.dropTable('tweets'),
    knex.schema.dropTable('users'),
  ])
};