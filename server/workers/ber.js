/*This script kicks off a worker that sends a request to the <> server route every 1 hour*/

/*To run in development environment: run npm dev-jobs from root directory*/

const axios = require('axios');
const schedule = require('node-schedule');

const updateSentimentMetrics = {
  scheduleJob: () => {
    rule = '0 * * * *';

    let job = schedule.scheduleJob(rule, () => {
      console.log('Executing update sentiment metrics job 1/2...');
      axios.get('http://localhost:4568/sentiment', {})
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
    });
  },
      
  init: () => {
    updateSentimentMetrics.scheduleJob();
  }
};

// (() => {
//   updateSentimentMetrics.init();
// })();
