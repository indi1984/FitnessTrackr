const express = require('express');
const routineActivitiesRouter = express.Router();
const { requireUser } = require('./utils');
const { UnauthorizedUpdateError } = require('../errors');
const { getRoutineById } = require('../db/routines');
const { canEditRoutineActivity, 
  getRoutineActivityById,
  updateRoutineActivity } = require('../db/routine_activities');

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

module.exports = routineActivitiesRouter;
