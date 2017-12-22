const fs = require('fs');
const randomNumber = require('../db/helpers.js').randomNumber;
const outfile = '../db/outUser.csv';

/*===============GENERATE USER DATA==================*/
/*=====================GOAL: 50K=====================*/
/*=================appx. 15% bot=====================*/

// Creates records with the following fields:
// id, bot_account

let user = '';

const generateUsers = () => {
  // Create 50,000 users
  for (let i = 1; i < 50001; i++) {
    // distributes accounts such that 15% are bots
    if (Math.floor(Math.random() * 100) <= 15) {
      user = `${i}, ${true}\r\n`;
      fs.appendFileSync(outfile, user, err => {
        console.log(err);
      });
    } else {
      user = `${i}, ${false}\r\n`;
      fs.appendFileSync(outfile, user, err => {
        console.log(err);
      });
    }
  }  
}


/*===========UNCOMMENT TO GENERATE USERS===========*/
// generateUsers();

