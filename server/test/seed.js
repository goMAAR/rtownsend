const faker = require('faker');
const fs = require('fs');
const randomNumber = require('../../db/helpers.js').randomNumber;
const outfile = 'favorites.csv';

/*========GENERATE SAMPLE DATA FOR NETWORK ROUTE===========*/
/*====================GOAL: 100,000===================*/

// Creates records with the following fields:
// tweet_id, favorited_id, favoriter_id, created_at, destroy

let favorite = '';
let random;

const generateFavorites = () => {
  // Ensure records for tweets that already exist
  for (var i = 1; i < 5001; i++) {
    // create 20 favorites per user
    for (let j = 0; j < 20; j++) {
      favorite = `${i},${randomNumber(10000000) + 1},${randomNumber(50000) + 1},${faker.date.recent().toISOString()},false\r\n`;
      fs.appendFileSync(outfile, favorite, err => {
        console.log(err);
      });
    }
  }
};

/*===========UNCOMMENT TO GENERATEFAVORITES===========*/
generateFavorites();


