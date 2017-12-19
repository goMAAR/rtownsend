const moment = require('moment');
const fs = require('fs');
const randomNumber = require('../server/helpers.js').randomNumber;
const outfile = '../server/outhourlyeng.csv';

/*===============GENERATE USER HOURLY ENGAGEMENT DATA==================*/
/*=======================GOAL: 2,160 (HOURS)=======================*/
/*===================BIAS CONSTRAINTS=======================*
 * each date should have 24 hours
 * there should be 90 dates
*========================================================*/

// Creates records with the following fields:
// date, hour, avg_BER

let hourlyEngagement = '';

const generateHourlyEngagements = () => {
  let date = moment();
  // Outer loop represents number of days to generate (90)
  for (let i = 0; i < 90; i++) {
    // Inner loop represents number of hours to generate per day (24)
    for (let j = 1; j < 25; j++) {
      hourlyEngagement = `${date.toISOString()}, ${j}, ${randomNumber(20)}\r\n`;
      fs.appendFileSync(outfile, hourlyEngagement, err => {
        console.log(err);
      });
    }
    date = moment(date).add(1, 'days');
  }
}


/*=============UNCOMMENT TO GENERATE HOURLY ENGAGEMENTS==========*/
// generateHourlyEngagements();

