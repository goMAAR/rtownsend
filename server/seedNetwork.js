const faker = require('faker');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/outNetwork.csv';

/*===============GENERATE FAVORITES DATA==================*/
/*=====================CONSTRAINTS=====================*/
/*=================appx. 50% influencer=====================*/

// Creates records with the following fields:
// created_at, updated_at, tweet_id, favoriter_id

let network = '';
let date;

// Influencers
const generateInfluencerFollows = () => {
  // Create a record for each odd user_id
  for (let i = 1; i < 50001; i+=2) {
    date = faker.date.recent().toISOString();
    // Influencers follow 10 users
    for (let j = 0; j < 10; j++) {
      network = `${date}, ${date}, ${i}, ${randomNumber(50000) + 1}\r\n`;
      fs.appendFileSync(outfile, network, err => {
        console.log(err);
      });
    }
  }
}

// Non-Influencers
const generateInfluencerFollowers = () => {
  // Create a record for each even user_id
  for (let i = 2; i < 50001; i+=2) {
    date = faker.date.recent().toISOString();
    // Non-Influencers follow 100 users
    for (let j = 0; j < 100; j++) {
      network = `${date}, ${date}, ${i}, ${randomNumber(50000) + 1}\r\n`;
      fs.appendFileSync(outfile, network, err => {
        console.log(err);
      });

    }
  }
}

/*===========UNCOMMENT TO GENERATE INFLUENCER FOLLOWERS===========*/
// generateInfluencerFollowers();
/*===========UNCOMMENT TO GENERATE INFLUENCER FOLLOWS=============*/
// generateInfluencerFollows();
