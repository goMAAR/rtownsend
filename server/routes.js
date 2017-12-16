const routes = require('express').Router();
const _ = require('underscore');
const Promise = require('bluebird');
const User = require('../db/user.js');
const users = require('./seedUser.js').users;

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

routes.get('/calculateTEI', (req, res) => {
  
})

module.exports = routes;

