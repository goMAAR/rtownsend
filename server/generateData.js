const faker = require('faker');
const underscore = require('underscore');

/*===============GENERATE USER DATA==================*/
/*=====================GOAL: 50K=====================*/
/*=================15% bot, 85% not==================*/

// Testing distribution with 100K
const users = [];
for (let i = 1; i < 10; i++) {
  let user = {};
  if (i < 5) {
    user = {
      id: i,
      timestamp: faker.date.recent(),
      bot_account: true
    }
  } else {
    user = {
      id: i,
      timestamp: faker.date.recent(),
      bot_account: false
    }
  }
  users.push(user);
}

module.exports.users = users;


/*===============GENERATE TWEETS DATA================*/
/*=====================GOAL: 10M=====================*/

