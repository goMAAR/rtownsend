const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const Tweet = require('../db/tweet.js');
const User = require('../db/user.js');

const app = express();
const routes = require('./routes');

app.use('/', routes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let port = 4568;
app.listen(port, () => {
  console.log(`listening on port: ${port}`)
});