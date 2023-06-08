const express = require('express');
const activitiesRouter = express.Router();
const { ActivityExistsError } = require('../errors');
const { getAllActivities,
  createActivity } = require('../db/activities');

// GET /api/activities/:activityId/routines

// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {
  try {
    res.send(await getAllActivities());
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
activitiesRouter.post('/', async (req, res, next) => {
  const { name, description } = req.body;
  try {
    if (req.body) {
      res.send(await createActivity({ name, description }));
    } else {
      throw ({
        error: "Duplicates",
        name: "Activity",
        message: ActivityExistsError(name)
      })
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId

module.exports = activitiesRouter;
