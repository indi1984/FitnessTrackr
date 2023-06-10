const express = require('express');
const routinesRouter = express.Router();
const { 
  getAllPublicRoutines,
  createRoutine,
  destroyRoutine,
  getRoutineById,
  updateRoutine,
  addActivityToRoutine } = require('../db')
const { 
  UnauthorizedError,
  UnauthorizedDeleteError,
  UnauthorizedUpdateError,
  DuplicateRoutineActivityError } = require('../errors');

// GET /api/routines
routinesRouter.get('/', async (req, res, next) => {
  try {
    const publicRoutines = await getAllPublicRoutines();
    res.send(publicRoutines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
routinesRouter.post('/', async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  if (!req.user) {
    next({
      error: "No user found",
      message: UnauthorizedError(),
      name: "Unauthorized Error"
    })
  }
  try {
    const newRoutine = await createRoutine({
      creatorId: req.user.id, 
      isPublic: isPublic,
      name: name,
      goal: goal
    });
    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routines/:routineId
routinesRouter.patch('/:routineId', async (req, res, next) => {
  const user = req.user;
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  const updateFields = { id: routineId };
  if (!user) {
    next({
      error: "No user found",
      message: UnauthorizedError(),
      name: "Unauthorized Error"
    })
  }
  if (isPublic === true || isPublic === false) {  // had to do it like this because if isPublic's new value was false, it made the if statement fail, and thus couldn't update the value to false
    updateFields.isPublic = isPublic;
  }
  if (name) {
    updateFields.name = name;
  }
  if (goal) {
    updateFields.goal = goal;
  }
  try {
    if (routineId === 'undefined') {
      throw ({
        error: "Unauthorized",
        name: "User",
        message:  "Routine id is undefined!"
      })
    } else  {
      const routine = await getRoutineById(routineId);
      if (user.id !== routine.creatorId) {
        res.status(403).send({
          error: "Unauthorized to update this routine",
          message: UnauthorizedUpdateError(req.user.username, routine.name),
          name: "Unauthorized Update Error"
        });
      }
    }
    const updatedRoutine = await updateRoutine(updateFields);
    res.send(updatedRoutine);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId
routinesRouter.delete('/:routineId', async (req, res, next) => {
  const creatorId = req.user.id;
  const { routineId } = req.params;
  try {
    const routine = await getRoutineById(routineId);
    if (creatorId !== routine.creatorId) {
      res.status(403).send({
        error: "Unauthorized to delete this routine",
        message: UnauthorizedDeleteError(req.user.username, routine.name),
        name: "Unauthorized Delete Error"
      });
    }
    await destroyRoutine(routineId);
    res.send(routine);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines/:routineId/activities
routinesRouter.post('/:routineId/activities', async (req, res, next) => {
  const { routineId } = req.params;
  try {
    const attachedActivities = await addActivityToRoutine(req.body);
    res.send(attachedActivities);
  } catch (error) {
    next({
      error: "Duplicate key",
      message: DuplicateRoutineActivityError(routineId, req.body.activityId),
      name: "Duplicate Routine Activity Error"
    });
  }
});

module.exports = routinesRouter;
