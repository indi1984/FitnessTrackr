const express = require('express');
const routineActivitiesRouter = express.Router();
const { requireUser } = require('./utils');
const { getRoutineById } = require('../db/routines');
const { UnauthorizedUpdateError, 
  UnauthorizedDeleteError } = require('../errors');
const { canEditRoutineActivity, 
  getRoutineActivityById,
  updateRoutineActivity,
  destroyRoutineActivity } = require('../db/routine_activities');

// PATCH /api/routine_activities/:routineActivityId
routineActivitiesRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
  const id = req.params.routineActivityId;
  const count = req.body.count;
  const duration = req.body.duration;
  const userId = req.user.id;
  const username = req.user.username;
  try {
    const isValid = await canEditRoutineActivity(id, userId);
    const routineActivity = await getRoutineActivityById(id);
    const routine = await getRoutineById(routineActivity.routineId);
    if (!isValid) {
      throw ({
        error: "Unauthorized",
        name: "User",
        message:  UnauthorizedUpdateError(username, routine.name)
      })
    } else {
      const updatedRoutineActivity = await updateRoutineActivity({
        id,
        count,
        duration
      })
      res.send(updatedRoutineActivity);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete('/:routineActivityId', requireUser, async (req, res, next) => {
  const id = req.params.routineActivityId;
  const userId = req.user.id;
  const username = req.user.username;
  try {
    const isValid = await canEditRoutineActivity(id, userId);
    const routineActivity = await getRoutineActivityById(id);
    const routine = await getRoutineById(routineActivity.routineId);
    if (!isValid) {
      throw ({
        statusCode: 403,
        error: "Unauthorized",
        name: "User",
        message:  UnauthorizedDeleteError(username, routine.name)
      })
    } else {
      const deletedRoutineActivity = await destroyRoutineActivity(id);
      res.send(deletedRoutineActivity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = routineActivitiesRouter;
