const routes = require('express').Router();
const users = require('./generateData.js').users;
const _ = require('underscore');
const User = require('../db/user.js');

/*==========UNCOMMENT TO SEED USERS==========*/
// routes.get('/seedUsers', (req, res) => {
//   // promisify this in the future
//   _.each(users, user => {
//     new User({
//       id: user.id,
//       bot_account: user.bot_account
//     }).save(null, {method: 'insert'}).then(model => {
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   });
//   res.sendStatus(200);
// });

module.exports = routes;