
const nr = require('newrelic')
const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const routes = require('./routes');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', routes);

let port = 4568;

app.listen(port, () => {
  console.log(`Port ${port} is listening to all incoming traffic`);
});
