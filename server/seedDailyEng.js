const moment = require('moment');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/outdailyeng.csv';

/*===============GENERATE USER DAILY ENGAGEMENT DATA==================*/
/*=======================GOAL: 90 (DAYS)=======================*/
/*===================BIAS CONSTRAINTS=======================*

*========================================================*/

let dailyEngagement = ``;

const generateDailyEngagements = () => {
  let date = moment();
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

