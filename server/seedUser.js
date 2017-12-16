const underscore = require('underscore');

/*===============GENERATE USER DATA==================*/
/*=====================GOAL: 50K=====================*/
/*=================appx. 15% bot=====================*/

const users = [];

//not quite getting to 50k so running in mult sequences:
  //1 - 1-16033
  //1a - 16034 - 24999
  //2 - 25000 - 50000

for (let i = 25000; i < 50001; i++) {
  let user = {};
  if (Math.floor(Math.random() * 100) <= 15) {
    user = {
      id: i,
      bot_account: true
    }
  } else {
    user = {
      id: i,
      bot_account: false
    }
  }
  users.push(user);
}

module.exports.users = users;



