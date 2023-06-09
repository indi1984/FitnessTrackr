require("dotenv").config()
const express = require("express")
const app = express()
const apiRouter = require('./api/index');
const volleyball = require('volleyball');
const bodyParser = require('body-parser')
const chalk = require("chalk");
const cors = require("cors");

// Setup your Middleware and API Router here
app.use(volleyball);
app.use(bodyParser.json());
app.use(cors());

// app.use((req, res, next) => {
//   console.log(chalk
//     .red
//     .inverse("<----------------------------- Body Logger  START ----------------------------->")
//   );
//   console.log(req.body);
//   console.log(chalk
//     .red("<------------------------------ Body Logger  END ------------------------------>")
//   );
//   next();
// });

app.use('/api', apiRouter);

module.exports = app;
