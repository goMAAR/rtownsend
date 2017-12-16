const faker = require('faker');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/outNetwork.csv';
/*===============GENERATE FAVORITES DATA==================*/
/*=====================CONSTRAINTS=====================*/
/*=================appx. 50% influencer=====================*/

// for i = 1-50001
  // if i even
    // i follows 10 random users only

let network = '';
let date;

//25,000 influencers
const generateInfluencerFollows = () => {
  for (let i = 1; i < 50001; i+=2) {
    date = faker.date.recent().toISOString();
    for (let j = 0; j < 10; j++) {
      network = `${date}, ${date}, ${i}, ${randomNumber(50000) + 1}\r\n`;
      fs.appendFileSync(outfile, network, err => {
        console.log(err);
      });
    }
  }
}

const generateInfluencerFollowers = () => {
  // for i even
  for (let i = 2; i < 50001; i+=2) {
    date = faker.date.recent().toISOString();
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
