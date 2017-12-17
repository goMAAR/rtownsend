const faker = require('faker');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/outusermetric.csv';

/*===============GENERATE USER METRIC DATA==================*/
/*=======================GOAL: 50,000=======================*/
/*===================BIAS CONSTRAINTS=======================*
 * one metric per user
 * 50% of users are influencers (all odd user_ids)
 **** 30% of influencers are extreme
 **** 30% are bots
 **** 40% are normal
 * 50% of users are non-influencers (all even user_ids)
 **** 75% are extreme
    **** 75% prefer bot posts
    **** 25% prefer regular posts
 **** 25% are not extreme
*========================================================*/

let userMetric = ``;

const generateRegularMetrics = () => {
  for (let i = 2; i < 50001; i +=2) {
    let extremeDist = randomNumber(100);
    // not extreme user //
    if (extremeDist > 75) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, 0, 10, 0, 20, 0, 20, 10, 100, 0\r\n`;
      fs.appendFileSync(outfile, userMetric, err => {
        console.log(err);
      });
    // extreme user //
    } else {
      let botDist = randomNumber(100);
      // prefers bots //
      if (botDist > 75) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, 10, .75, 20, 20, 0, 10, 100, 1\r\n`;
        fs.appendFileSync(outfile, userMetric, err => {
          console.log(err);
        });       
        // does not prefer bots//
      } else {
        userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, 10, .75, 20, 0, 20, 10, 100, 0\r\n`;
        fs.appendFileSync(outfile, userMetric, err => {
          console.log(err);
        }); 
      }
    }
  }
}


//INFLUENCERS//
const generateInfluencerMetrics = () => {
  for (let i = 1; i < 50001; i+=2) {
    let random = randomNumber(100);
    // extreme influencer //
    if (random < 31) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, .01, 0, 5, 0, 5, 100, 10, 0\r\n`;
      fs.appendFileSync(outfile, userMetric, err => {
        console.log(err);
      });
      // bot //
    } else if (random > 69) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, .01, 0, 5, 5, 0, 100, 10, 1\r\n`;
      fs.appendFileSync(outfile, userMetric, err => {
        console.log(err);
      });
      // non-extreme influencer //
    } else {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, 0, .01, 0, 5, 0, 5, 100, 10, 0\r\n`;
      fs.appendFileSync(outfile, userMetric, err => {
        console.log(err);
      });
    }
  }
}


/*===========UNCOMMENT TO GENERATE INFLUENCER METRICS===========*/
// generateInfluencerMetrics();
/*============UNCOMMENT TO GENERATE REGULAR METRICS==============*/
// generateRegularMetrics();

