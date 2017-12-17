const faker = require('faker');
const fs = require('fs');
const randomNumber = require('./helpers.js').randomNumber;
const outfile = '../server/outnetworkmetric.csv';

/*===============GENERATE NETWORK METRIC DATA==================*/
/*======================GOAL: 2,750,000=====================*/
/*===================BIAS CONSTRAINTS=======================*
 * one metric per network
 * randomly distribute metric between 0 - 1
*========================================================*/

let networkMetric = ``;

const generateNetworkMetrics = () => {
  for (let i = 1; i < 2750001; i++) {
    networkMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, ${randomNumber(1)}\r\n`;
    fs.appendFileSync(outfile, networkMetric, err => {
      console.log(err);
    });
  }
} 

/*===========UNCOMMENT TO GENERATE NETWORK METRICS===========*/
// generateNetworkMetrics();

