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
      throw new Error({
        message: UserTakenError(username),
        name: username,
      })
    }
    if (password.length < 8) {
      throw new Error({
        message: PasswordTooShortError(),
        name: password,
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
  } catch ({ message, name }) {
    next({ message, name});
  }
});


// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = usersRouter;
