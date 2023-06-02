const client = require("./client");
const bcrypt = require('bcrypt');


// database functions

// user functions
async function createUser({ username, password }) {
  const SALT_COUNT = 10;
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
  try {
    const { rows: [ user ] } = await client.query(/*sql*/`
      INSERT INTO users (username, password) 
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [ username, hashedPassword ]);
    delete user.password;
    return user;
  } catch (error) {
    console.error("Error creating user!", error);
  }
}

async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  const hashedPassword = user.password;
  const isValid = await bcrypt.compare(password, hashedPassword)
  if (isValid) {
    // return the user object (without the password)
    delete user.password;
    return user;
  }
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(/*sql*/`
      SELECT id, username, password
      FROM users
      WHERE id = $1;
    `, [ userId ]);
    delete user.password;
    return user;
  } catch (error) {
    console.error("Error getting users by ID!", error);
  }
}

async function getUserByUsername(userName) {
  try {
    const { rows: [ user ] } = await client.query(/*sql*/`
      SELECT *
      FROM users
      WHERE username = $1;
    `, [ userName ]);
    return user;
  } catch (error) {
    console.error("Error getting user by username!", error);
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
