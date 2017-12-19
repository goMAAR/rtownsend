const router = require('express').Router();
// const _ = require('underscore');
// const Promise = require('bluebird');
// const Tweet = require('../db/tweet.js');
// const User = require('../db/user.js');
// const Dailyengagement = require('../db/dailyengagement.js');
// const Favorite = require('../db/favorite.js');
// const Hourlyengagement = require('../db/hourlyengagement.js');
// const Network = require('../db/network.js');
// const Networkmetric = require('../db/networkmetric.js');
// const Usermetric = require('../db/usermetric.js');

/*==============ROUTES HERE==============*/
// const winston = require('winston');
// require('winston-logstash');

// winston.add(winston.transports.Logstash, {
//   port: 5044,
//   host: 'localhost'
// });


router.get('/', (req, res) => {
  // winston.info(req.headers);
  res.send('get okay');
});

router.post('/', (req, res) => {
  // winston.info(req.headers);
  res.send('post okay');
})

module.exports = router;

