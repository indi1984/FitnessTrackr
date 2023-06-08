const express = require('express');
const apiRouter = express.Router();
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db/users');
const usersRouter = require('./users');
const activitiesRouter = require('./activities');
const routinesRouter = require('./routines');
const routineActivitiesRouter = require('./routineActivities');
const { JWT_SECRET } = process.env;


apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }
  next();
});

// GET /api/health
// apiRouter.get('/health', async (req, res, next) => {

  
// });

apiRouter.use('/users', usersRouter);
apiRouter.use('/activities', activitiesRouter);
apiRouter.use('/routines', routinesRouter);
apiRouter.use('/routine_activities', routineActivitiesRouter);

//* 404 Handler (Non-Exiting Routes)
apiRouter.get('*', (req, res) => {
  res.status(404).send(/*html*/`
    <h1>Sorry, this route does not exist!</h1>
  `);
});

//* Error Handler
apiRouter.use((error, req, res) => {
  console.error(error);
  res.send({
    name: error.name,
    message: error.message,
    data: [],
    error: true
  });
});

module.exports = apiRouter;
