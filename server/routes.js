/*===================DEPENDENCIES===================*/
const router = require('express').Router();

const getNetwork = require('./helpers/getNetwork.js');
const getFavorite = require('./helpers/getFavorite.js');
const getTweet = require('./helpers/getTweet.js');
const postNetwork = require('./helpers/postNetwork.js');
const postSentiment = require('./helpers/postSentiment.js');


/*===============CREATE NEW SENTIMENT METRIC==============*/

/*This route will be hit every hour by an automated worker*/

router.get('/sentiment', (req, res) => {
  postSentiment.createSentimentRecord((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.sendStatus(200);
    }
  });
});

/*==================SEND NETWORK METRICS==================*/

/*This route will be hit every 10 minutes by an automated worker*/

router.get('/network', (req, res) => {
  console.log('Executing updateNetworkMetrics job 2/2...');
  postNetwork.submitRecentNetworks( (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});


/*================TWEET QUEUE HANDLER================*/

/* Uncomment to manually send favorite to queue */
router.get('/postTweet', (req, res) => {
  getTweet.postTweet((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// handle queue errors
getTweet.tweetApp.on('error', err => {
  console.log(err.message);
});

// uncomment to start polling queue
getTweet.tweetApp.start();
// uncomment to stop polling queue
// getTweet.tweetApp.stop();


/*================FAVORITE QUEUE HANDLER================*/

/* Uncomment to manually send favorite to queue */
router.get('/postFavorite', (req, res) => {
  console.log('commence handling favortie with process', process.pid); 
  getFavorite.postFavorite((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// handle queue errors
getFavorite.favoriteApp.on('error', err => {
  console.log(err.message);
});

// uncomment to start polling queue
getFavorite.favoriteApp.start();
// uncomment to stop polling queue
// getFavorite.favoriteApp.stop();

/*=====FAKE QUEUE HANDLING=====*/

/* Uncomment to manually send favorite to fake queue */
router.get('/postFavoriteFake', (req, res) => {
  console.log('commence handling favorite');
  getFavorite.postFavoriteFake((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// handle queue errors
getFavorite.fakeFavoriteApp.on('error', err => {
  console.log(err.message);
});

// uncomment to start polling queue
// getFavorite.fakeFavoriteApp.start();
// uncomment to stop polling queue
getFavorite.fakeFavoriteApp.stop();

/*================NETWORK QUEUE HANDLER================*/

/* Uncomment to manually send network to queue */
router.get('/postNetwork', (req, res) => {
  console.log('in post network route with process', process.pid);
  getNetwork.postNetwork((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// handle queue errors
getNetwork.networkApp.on('error', err => {
  console.log(err.message);
});

/* uncomment to start polling queue */
getNetwork.networkApp.start();
/* uncomment to stop polling queue */
// getNetwork.networkApp.stop();

/*=======================================================*/

module.exports = router;