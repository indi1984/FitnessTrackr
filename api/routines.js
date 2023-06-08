const express = require('express');
const routinesRouter = express.Router();
const { requireUser } = require('./utils');
const { getAllRoutines } = require('../db/routines');

// GET /api/routines
routinesRouter.get('/', async (req, res, next) => {
  try {
    res.send(await getAllRoutines());
  } catch (error) {
    next(error);
  }
});

// POST /api/routines

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
