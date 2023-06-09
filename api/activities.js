const express = require('express');
const activitiesRouter = express.Router();
const { requireUser } = require('./utils');
const { ActivityExistsError } = require('../errors');
const { getAllActivities,
  createActivity,
  getActivityByName } = require('../db/activities');

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
activitiesRouter.post('/', requireUser, async (req, res, next) => {
  const request = req.body;
  try {
    const existingActivity = await getActivityByName(request.name);
    if (!existingActivity) {
      const { name, description } = await createActivity(request);    
      res.send({ description, name });
    } else {
      throw ({
        error: "Duplicates",
        name: "Activity",
        message: ActivityExistsError(req.body.name),
      })
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId

module.exports = activitiesRouter;
