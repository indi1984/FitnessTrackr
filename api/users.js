/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const { UserTakenError, PasswordTooShortError } = require('../errors');
const { createUser, getUserByUsername } = require('../db/users');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const _user = await getUserByUsername(username);
    if (_user) {
      // throw new Error(UserTakenError(username))
      throw ({
        error: "Requirements",
        name: "User",
        message: UserTakenError(username)
      })
    }
    if (password.length < 8) {
      throw ({
        error: "Requirements",
        name: "Password",
        message: PasswordTooShortError()
      })
    }
    const user = await createUser({
      username,
      password
    })
    const token = jwt.sign({ 
      id: user.id, 
      username
    }, JWT_SECRET)
    res.send({ 
      message: "Thanks for signing up for our service.",
      token,
      user 
    });
  } catch (error) {
    next(error);
  }
});


// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    res.status(200).send(req.body);
  } catch (error) {
    next(error);
  }  
});


// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    res.status(200).send(req.body);
  } catch (error) {
    next(error);
  }  
});

// GET /api/users/:username/routines
usersRouter.get('/:username/routines', async (req, res, next) => {
  const { username } = req.params;
  try {
    res.status(200).send(req.params);
  } catch (error) {
    next(error);
  }  
});

module.exports = usersRouter;
