/*This script kicks off a worker that sends a request to the network server route every 10 minutes*/

/*To run in development environment: run npm network-worker from root directory*/

const axios = require('axios');
const schedule = require('node-schedule');

const updateNetworkMetrics = {
  scheduleJob: () => {
    rule = '*/10 * * * *';

    let job = schedule.scheduleJob(rule, () => {
      console.log('Executing send network metrics job 1/2...');
      axios.get('http://localhost:4568/network', {})
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
    });
  },
      
  init: () => {
    updateNetworkMetrics.scheduleJob();
  }
};

(() => {
  updateNetworkMetrics.init();
})();
