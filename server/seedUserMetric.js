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

// Creates records with the following fields:
// created_at, updated_at, user_id, content_extremity_index, influencer_ratio,
  // network_extremity_index, total_favorites, bot_favorites, user_favorites,
  // follower_count, following_count, bot_engagement_ratio

let userMetric = '';

// Non-Influencers
const generateRegularMetrics = () => {
  // Create 1 record for all non-influencer users (even user_ids)
  for (let i = 2; i < 50001; i +=2) {
    // Use extremDist to distribute 75% of non-influencers as 'extreme in sentiment'
    let extremeDist = randomNumber(100);
    // non-extreme user
    if (extremeDist > 75) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, 0, 10, 0, 20, 0, 20, 10, 100, 0\r\n`;
      fs.appendFileSync(outfile, userMetric, err => {
        console.log(err);
      });
    // extreme user
    } else {
      let botDist = randomNumber(100);
      // prefers bots
      if (botDist > 75) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, 10, .75, 20, 20, 0, 10, 100, 1\r\n`;
        fs.appendFileSync(outfile, userMetric, err => {
          console.log(err);
        });       
        // does not prefer bots
      } else {
        userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, 10, .75, 20, 0, 20, 10, 100, 0\r\n`;
        fs.appendFileSync(outfile, userMetric, err => {
          console.log(err);
        }); 
      }
    }
  }
}


//Influencers
const generateInfluencerMetrics = () => {
  // Create 1 record for each influencer user (odd user_id)
  for (let i = 1; i < 50001; i+=2) {
    // use random to distribute users between type of account
    let random = randomNumber(100);
    // extreme influencer
    if (random < 31) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, .01, 0, 5, 0, 5, 100, 10, 0\r\n`;
      fs.appendFileSync(outfile, userMetric, err => {
        console.log(err);
      });
      // bot
    } else if (random > 69) {
      userMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, .75, .01, 0, 5, 5, 0, 100, 10, 1\r\n`;
      fs.appendFileSync(outfile, userMetric, err => {
        console.log(err);
      });
      // non-extreme influencer
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

