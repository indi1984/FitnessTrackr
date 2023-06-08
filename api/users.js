/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const { UserTakenError, PasswordTooShortError, UnauthorizedError } = require('../errors');
const { createUser, getUserByUsername, getUser, getUserById } = require('../db/users');
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
    const user = await getUser({ username, password });
    if (user) {
      const token = await jwt.sign({
        id: user.id,
        username
      }, JWT_SECRET);
      const verifiedUser = {
        message: "you're logged in!",
        user,
        token
      }
      res.send(verifiedUser);
    }
  } catch (error) {
    next(error);
  }  
});

// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');
    if (!auth) {
      res.status(401).send({
        error: "Requirements",
        name: "Login",
        message: UnauthorizedError()
      })
    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);
      try {
        const { id } = jwt.verify(token, JWT_SECRET);
        if (id) {
          req.username = await getUserById(id);
          res.send(req.username);
        }
      } catch (error) {
        next(error);
      }
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
