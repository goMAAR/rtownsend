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

// Creates records with the following fields:
// created_at, updated_at, network_id, followed_favorites_ratio

let networkMetric = '';

const generateNetworkMetrics = () => {
  // Create 1 record for every network relationship
  for (let i = 1; i < 2750001; i++) {
    networkMetric = `${faker.date.recent().toISOString()}, ${faker.date.recent().toISOString()}, ${i}, ${randomNumber(1)}\r\n`;
    fs.appendFileSync(outfile, networkMetric, err => {
      console.log(err);
    });
  }
} 

/*===========UNCOMMENT TO GENERATE NETWORK METRICS===========*/
// generateNetworkMetrics();

