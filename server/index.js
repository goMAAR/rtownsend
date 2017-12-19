const apm = require('elastic-apm-node').start({
  appName: 'engagement'
});

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const routes = require('./routes');

app.use('/', routes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(apm.middleware.express());

let port = 4568;
app.listen(port, () => {
  console.log(`listening on port: ${port}`)
});