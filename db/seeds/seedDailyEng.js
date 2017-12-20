const moment = require('moment');
const fs = require('fs');
const randomNumber = require('../db/helpers.js').randomNumber;
const outfile = '../db/outfile.csv';

/*===============GENERATE USER DAILY ENGAGEMENT DATA==================*/
/*=======================GOAL: 90 (DAYS)=======================*/
/*===================BIAS CONSTRAINTS=======================*

*========================================================*/

// Creates records with the following fields:
// date, avg_BER

let dailyEngagement = '';

const generateDailyEngagements = () => {
  let date = moment();
  // Create 90 days worth of data
  for (let i = 0; i < 90; i++) {
    dailyEngagement = `${date.toISOString()}, ${randomNumber(20)}\r\n`;
    fs.appendFileSync(outfile, dailyEngagement, err => {
      console.log(err);
    });
    date = moment(date).add(1, 'days');
  }
}


/*=============UNCOMMENT TO GENERATE HOURLY ENGAGEMENTS==========*/
generateDailyEngagements();

