const { attachActivitiesToRoutines } = require('./activities');
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [ routine ] } = await client.query(/*sql*/`
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [ creatorId, isPublic, name, goal ]);
    return routine;
  } catch (error) {
    console.error("Error creating activity!", error);
    throw error; 
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [ routine ] } = await client.query(/*sql*/`
      SELECT id, creatorId, isPublic, name, goal
      FROM routines
      WHERE id = $1;
    `, [ id ]);
    console.log(routine)
    return routine;
  } catch (error) {
    console.error("Error getting routine by id!", error);
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(/*sql*/`
      SELECT * 
      FROM routines    
    `);
    return rows;
  } catch (error) {
    console.error("Error getting routines without and activity!", error);
    throw error;
  }
}

//TODO ASK QUESTION IN CLASS MONDAY
async function getAllRoutines() {
    try {
    const { rows } = await client.query(/*sql*/`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      INNER JOIN users
      ON "creatorId" = users.id;   
    `);
    // return await attachActivitiesToRoutines(rows);
    return rows;
  } catch (error) {
    console.error("Error getting all routines!", error);
    throw error;
  }
}

async function getAllPublicRoutines() {
    try {
    const { rows: routines } = await client.query(/*sql*/`
      SELECT * 
      FROM routines 
      WHERE "isPublic" = true   
    `);
    return routines;
  } catch (error) {
    console.error("Error getting all public routines!", error);
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {

}

async function getPublicRoutinesByUser({ username }) {

}

async function getPublicRoutinesByActivity({ id }) {

}

async function updateRoutine({ id, ...fields }) {

}

async function destroyRoutine(id) {

}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
