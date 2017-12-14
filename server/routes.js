const routes = require('express').Router();
const users = require('./generateData.js').users;
const _ = require('underscore');
const User = require('../db/user.js');

routes.get('/populateUsers', (req, res) => {
  console.log('USERS: ', users);
  //loop through users
  _.each(users, user => {
    //query db - add each user to db
    new User({
      id: user.id,
      bot_account: user.bot_account
    }).save(null, {method: 'insert'}).then(model => {
      console.log(model);
    })
    .catch(err => {
      console.log(err);
    });
  });
  res.sendStatus(200);
});

module.exports = routes;