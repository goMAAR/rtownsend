
const nr = require('newrelic')
const express = require('express');
const bodyParser = require('body-parser');

const cluster = require('cluster');


if (cluster.isMaster) {
  const numWorkers = require('os').cpus().length;

  console.log(`Master cluster setting up ${numWorkers} workers`);

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('online', worker => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
    console.log('Starting new worker');
    cluster.fork();
  });
} else {
  const app = express();
  const routes = require('./routes');

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  app.use('/', routes);

  let port = 4568;
  app.listen(port, () => {
    console.log(`Process ${process.pid} is listening to all incoming traffic`);
  });
}


