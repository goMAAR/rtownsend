const faker = require('faker');
const underscore = require('underscore');

/*===============GENERATE USER DATA==================*/
/*=====================GOAL: 50K=====================*/

// Testing distribution with 100K
const users = [];
for (let i = 1; i < 101; i++) {
  let user = {};
  if (i < 15) {
    user = {
      id: i,
      timestamp: faker.date.recent(),
      is_bot: true
    }
  } else {
    user = {
      id: i,
      timestamp: faker.date.recent(),
      is_bot: false
    }
  }
  users.push(user);
}

console.log(users);