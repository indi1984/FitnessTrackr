require("dotenv").config()
const express = require("express")
const app = express()
const apiRouter = require('./api/index');
const volleyball = require('volleyball');
const bodyParser = require('body-parser')

// Setup your Middleware and API Router here
app.use(volleyball);
app.use(bodyParser.json());
// app.use(express.json());

app.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");
  next();
});

app.use('/api', apiRouter);

module.exports = app;
