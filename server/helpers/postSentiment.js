/*===================DEPENDENCIES===================*/

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
const networkQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/networkPost';

const networkPost = new AWS.SQS();

const redis = require('../../db/redis/index.js');

const networkStatQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/networkStat';

const Currentengagement = require('../../db/currentengagement.js');
const Hourlyengagement = require('../../db/hourlyengagement.js');

/*====================================================*/

let date, hour, ISOdate;

/*=======================EXPORTS=======================*/

module.exports = {

  createSentimentRecord: cb => {

    date = new Date();
    hour = date.getHours();
    ISOdate = date.toISOString();

    //fetch current record and add to hourly records table
    new Currentengagement().fetchAll()
    .then(record => {
      if (!record.attributes) {
        console.log('no record found');
        new Currentengagement({date: ISOdate, avg_BER: 0, hour: hour, ber_sum: 0, favorites_count: 0})
          .save()
          .then(record => {
            console.log('successfully created new sentiment record');
            cb(null, data);
          })
          .error(err => {
            console.log(err);
            cb(err);
          })
      } else {
        console.log('record found with attributes: ', record.attributes);
        new Hourlyengagement({date: record.attributes.date, avg_BER: record.attributes.avg_BER, hour: record.attributes.hour, ber_sum: record.attributes.ber_sum, favorites_count: record.attributes.favorites_count})
        .save()
        // over-write previous current engagement record
        .then(result => {
          console.log('successfully saved result: ', result.attributes);
          new Currentengagement({date: date, avg_BER: 0, hour: hour, ber_sum: 0, favorites_count: 0})
          .save()
          .then(record => {
            console.log('successfully created new sentiment record');
            cb(null, data);
          })
          .error(err => {
            console.log(err);
            cb(err);
          })
        })
      }
    })
    // update record in db
  } 

};