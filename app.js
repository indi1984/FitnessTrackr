require("dotenv").config()
const express = require("express")
const app = express()
const apiRouter = require('./api/index');
const volleyball = require('volleyball');

// Setup your Middleware and API Router here
app.use(volleyball);
app.use(express.json());

app.use('/api', apiRouter);

module.exports = app;
