const fs = require('fs');
const randomNumber = require('../helpers.js').randomNumber;
const outfile = '../outTweet.csv';

/*===============GENERATE TWEETS DATA================*/
/*=====================GOAL: 10M=====================*/

// Creates records with the following fields:
// id, user_id, text, tweet_extremity_index, favorites_count

/*==================Tweet word bank==================*/

const prefaces = [
'Ask me why I think',
'After much consideration I have finally decided that',
'Today made me realize',
'Have you ever thought about how',
];
const extremeWords =  ['awesome',
  'stupid',
  'amazing',
  'awful'
];
const neutralWords = ['whatever',
  'fine',
  'a thing',
  'meh'
];
const nouns =   ['pumpkin spice lattes',
  'dogs that skateboard', 
  'critically acclaimed foreign films',
  'all of my ideas',
  'old timey hats',
  'footlong sandwiches from Subway',
  'chatty cashiers',
  'my imaginary friends from elementary school'
];

/*=========GENERATION FUNCTIONS AND VARIABLES=========*/


let user_id, prefaceIndex, nounIndex, workIndex, extremeFlag;

const makeTweet = (preface, noun, word) => {
  return `${preface} ${noun} are ${word}`;
};

let tweet = '';

const generateTweets = () => {
  // Creates 10 million tweets
  for (let i = 1; i < 10000001; i++) {
    user_id = randomNumber(50000) + 1;
    prefaceIndex = randomNumber(4);
    nounIndex = randomNumber(8);
    wordIndex = randomNumber(4);
    favoritesCount = randomNumber(10);
    // use extreme flag to distribute tweet sentiment
    extremeFlag = randomNumber(100);
    // divides tweets into approximately 76% 'extreme in sentiment' and the remainder 'neutral in sentiment'
    if (extremeFlag < 77) {
      tweet = `${i}, ${user_id}, ${makeTweet(prefaces[prefaceIndex], nouns[nounIndex], extremeWords[wordIndex])}, .75, ${favoritesCount}\r\n`;
    } else {
      tweet = `${i}, ${user_id}, ${makeTweet(prefaces[prefaceIndex], nouns[nounIndex], neutralWords[wordIndex])}, 0, ${favoritesCount}\r\n`;
    }
    fs.appendFileSync(outfile, tweet, err => {
      console.log(err);
    });
  }
}
/*===========UNCOMMENT TO GENERATE TWEETS===========*/
// generateTweets();


/*=========EFFICIENCY LOG=========*/
// Timed out at 90167 calls initially
// Currently loads to file in 17 minutes; file upload to db in 5 minutes or so
