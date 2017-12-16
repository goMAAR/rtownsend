const underscore = require('underscore');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/outTweet.csv';

/*===============GENERATE TWEETS DATA================*/
/*=====================GOAL: 10M=====================*/

// const tweets = [];

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


const makeTweet = (preface, noun, word) => {
  return `${preface} ${noun} are ${word}`;
};

let tweet = '';

const outputTweets = () => {
  for (let i = 1; i < 10000001; i++) {
    let user_id = randomNumber(50000) + 1;
    let prefaceIndex = randomNumber(4);
    let nounIndex = randomNumber(8);
    let wordIndex = randomNumber(4);
    let extremeFlag = randomNumber(100);
    if (extremeFlag < 77) {
      tweet = `${i}, ${user_id}, ${makeTweet(prefaces[prefaceIndex], nouns[nounIndex], extremeWords[wordIndex])}, .75\r\n`;
    } else {
      tweet = `${i}, ${user_id}, ${makeTweet(prefaces[prefaceIndex], nouns[nounIndex], neutralWords[wordIndex])}, 0\r\n`;
    }
    fs.appendFileSync(outfile, tweet, err => {
      console.log(err);
    });
  }
}
/*===========UNCOMMENT TO GENERATE TWEETS===========*/
outputTweets();


/*=========EFFICIENCY LOG=========*/
// Times out at 90167 calls
// 10
