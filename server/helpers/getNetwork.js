/*===================DEPENDENCIES===================*/

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
const networkQueueUrl = 'https://sqs.us-west-1.amazonaws.com/307495610107/networkPost';

const sqs = new AWS.SQS();

const Usermetric = require('../../db/usermetric.js');
const Network = require('../../db/network.js');
const redis = require('../../db/redis/index.js');

/*=======================================================*/

/* Constants for manually posting to queue */

const exampleNetwork = {
  follower_id: 40005,
  followed_id: 400,
  created_at: '2017-12-15 22:02:52.056-08',
  // destroy: true
  destroy: false
};

const params = {
  MessageBody: JSON.stringify(exampleNetwork),
  QueueUrl: networkQueueUrl,
  DelaySeconds: 0
};

/*=======================EXPORTS=======================*/

module.exports = {

  postNetwork: (cb) => {
      sqs.sendMessage(params, (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, data);
      }
    });
  },

  networkApp: Consumer.create({
    queueUrl: networkQueueUrl,
    handleMessage: (message, done) => {
      let followedFollowerCount, followedIR, followedCEI, followerID, followedID, followerFollowingCount, followerIR, followerNEISum, followerNEI;
      body = JSON.parse(message.Body);
      if (body.destroy) {
        // delete record
        new Network({follower_id: body.follower_id, followed_id: body.followed_id}).fetch()
        .then(network => {
          new Network({id: network.id})
          .destroy()
          .then(result => {
            console.log('successfully destroyed record');
          })
          /* will research more complete error handling for nonexistent records */
          .catch(err => {
            console.log(err);
          });
          done();
        })
      } else {
        // create new record
        followerID = body.follower_id;
        followedID = body.followed_id;
        return new Usermetric({user_id: followedID}).fetch()
        // updated user metrics for followed user
        .then(followed => {
          followedFollowerCount = followed.attributes.follower_count + 1;
          followedIR = followed.attributes.following_count/followedFollowerCount;
          followedCEI = followed.attributes.content_extremity_index;
          return new Usermetric({follower_count: followedFollowerCount, influencer_ratio: followedIR})
          .save()
          // update user metrics for follower user
          .then(followedRes => {
            console.log('successfully updated followed record');
            new Usermetric({user_id: followerID}).fetch()
            .then(follower => {
              followerFollowingCount = follower.attributes.following_count + 1;
              followerIR = followerFollowingCount/follower.attributes.follower_count;
              followerNEISum = follower.attributes.nei_sum + followedCEI;
              followerNEI = followerNEISum/follower.attributes.following_count;
              return new Usermetric({following_count: followerFollowingCount, influencer_ratio: followerIR, nei_sum: followerNEISum, network_extremity_index: followerNEI})
              .save()
              // add new network
              .then(updatedFollower => {
                console.log('successfully updated follower record');
                // insert network object into Redis cache
                redis.hmset(updatedFollower.attributes.id, {
                  'follower_id': body.follower_id, 
                  'followed_id': body.followed_id, 
                  'followed_influencer_ratio': followedIR
                }, (err, reply) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(reply);
                  }
                });
                new Network({follower_id: body.follower_id, followed_id: body.followed_id, followed_influencer_ratio: followedIR})
                .save()
                .then(network => {
                  console.log('successfully saved new network');
                  done();
                })
              })
            })
          })
        })
        .catch(err => {
          console.log(err);
        });
      }
    }
  })

};