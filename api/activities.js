const express = require('express');
const activitiesRouter = express.Router();
const { requireUser } = require('./utils');
const { getPublicRoutinesByActivity } = require('../db/routines');
const { ActivityExistsError,
  ActivityNotFoundError } = require('../errors');
const { getAllActivities,
  createActivity,
  updateActivity,
  getActivityByName, 
  getActivityById} = require('../db/activities');

// GET /api/activities/:activityId/routines
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
  const activityId = req.params.activityId;
  try {
    const publicRoutines = await getPublicRoutinesByActivity({ id: activityId });
    if (publicRoutines  && publicRoutines.length) {
      res.send(publicRoutines);
    } else {
      throw ({
        error: "Duplicates",
        name: "Routines",
        message: ActivityNotFoundError(activityId)
      })
    }
  } catch (error) {
    next(error);
  } 
});

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
      res.send({ name, description });
    } else {
      throw ({
        error: "Duplicates",
        name: "Activity",
        message: ActivityExistsError(req.body.name)
      })
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
  const id = req.params.activityId;
  const name = req.body.name;
  const description = req.body.description;
  try {
    const activityByName = await getActivityByName(name);
    const activityById = await getActivityById(id);
    if (activityByName) {
      throw ({
        error: "Duplicate",
        name: "Activity Name",
        message: ActivityExistsError(name)
      })
    } else if (!activityById) {
      throw ({
        error: "Does not exist",
        name: "Activity Name",
        message: ActivityNotFoundError(id)
      })
    } else {
      const changedActivity = await updateActivity({
         id, 
         name, 
         description 
      });  
      res.send(changedActivity);  
    }
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;
