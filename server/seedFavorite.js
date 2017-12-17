const faker = require('faker');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/favorite.csv';

/*===============GENERATE NETWORK DATA==================*/
/*====================GOAL: 25,000===================*/
/*=================BIAS CONSTRAINTS=====================*
 * even numbered (ie: non-influencer) users like more tweets than odd numbered (ie: influencer) users
 ******* bias constrains below are for stress testing consideration *******
 * 12% of likes belong to regular users (ie: other even ids)
 * 25% go to bots
 * 13% go to odd ids
*========================================================*/

let favorite = ``;

// Non-Influencers
const generateRegularFavorites = () => {
  for (var i = 1; i < 500001; i++) {
    if (randomNumber(100) < 13) {
      for (let j = 0; j < 20; j++) {
        favorite = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${randomNumber(10000000) + 1}, ${i}\r\n`;
        fs.appendFileSync(outfile, favorite, err => {
          console.log(err);
        });
      }
    } else {
      for (let k = 0; k < 5; k++) {
        favorite = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${randomNumber(10000000) + 1}, ${i}\r\n`;
        fs.appendFileSync(outfile, favorite, err => {
          console.log(err);
        }); 
      }
    }
  }
}

const generateInfluencerFavorites = () => {
  for (var i = 2; i < 50001; i+=2) {
    for (let j = 0; j < 2; j++) {
      favorite = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${randomNumber(10000000) + 1}, ${i}\r\n`;
      fs.appendFileSync(outfile, favorite, err => {
        console.log(err);
      });
    }
  }
}


/*===========UNCOMMENT TO GENERATE INFLUENCER FAVORITES===========*/
// generateInfluencerFavorites();
/*============UNCOMMENT TO GENERATE REGULAR FAVORITES==============*/
// generateRegularFavorites();

