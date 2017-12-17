const faker = require('faker');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/favorite.csv';

/*===============GENERATE NETWORK DATA==================*/
/*====================GOAL: 275,000===================*/
/*=================BIAS CONSTRAINTS=====================*
 * even numbered (ie: non -influencer) users like more tweets than odd numbered (ie: influencer) users
*========================================================*/

// Creates records with the following fields:
// created_at, updated_at, followed_id, follower_id

let favorite = '';
let random;

/*RESEED NETWORK DATA*/

// Non-Influencers
const generateRegularFavorites = () => {
  // Create records for all odd ids starting with 1
  for (var i = 2; i < 50001; i+=2) {
    // 24% of non-influencers favorite often
    if (randomNumber(100) < 25) {
      // create 20 favorites per user
      for (let j = 0; j < 20; j++) {
        favorite = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${randomNumber(10000000) + 1}, ${i}\r\n`;
        fs.appendFileSync(outfile, favorite, err => {
          console.log(err);
        });
      }
    } else {
      // the other 76% favorite less frequently
      // create 5 favorites per user
      for (let k = 0; k < 5; k++) {
        favorite = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${randomNumber(10000000) + 1}, ${i}\r\n`;
        fs.appendFileSync(outfile, favorite, err => {
          console.log(err);
        }); 
      }
    }
  }
}

// Influencers
const generateInfluencerFavorites = () => {
  // Create records for all even ids starting with 2
  for (var i = 1; i < 50001; i+=2) {
    // Create 2 favorites per user
    for (let j = 0; j < 2; j++) {
      favorite = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${randomNumber(10000000) + 1}, ${i}\r\n`;
      fs.appendFileSync(outfile, favorite, err => {
        console.log(err);
      });
    }
  }
}

// Random
const generateRandomFavorites = () => {
  // Generate 10k random favorites for goal of 275k total favorites
  for (var i = 0; i < 10000; i++) {
    random = randomNumber(50000);
    favorite = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${randomNumber(10000000) + 1}, ${random}\r\n`;
    fs.appendFileSync(outfile, favorite, err => {
      console.log(err);
    });
  }
}


/*===========UNCOMMENT TO GENERATE INFLUENCER FAVORITES===========*/
// generateInfluencerFavorites();
/*============UNCOMMENT TO GENERATE REGULAR FAVORITES==============*/
// generateRegularFavorites();
/*============UNCOMMENT TO GENERATE RANDOM FAVORITES==============*/
// generateRandomFavorites();

