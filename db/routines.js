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

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(/*sql*/`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      INNER JOIN users
      ON routines."creatorId" = users.id;   
    `);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error("Error getting all routines!", error);
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(/*sql*/`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      INNER JOIN users
      ON routines."creatorId" = users.id
      WHERE routines."isPublic" = true;   
    `);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error("Error getting all public routines!", error);
    throw error;
  }
}

// async function getAllPublicRoutines() {
//   try {
//     const routines = await getAllRoutines()
//     const publicRoutines = routines.filter((routine) => routine.isPublic === true);
//     return publicRoutines;
//   } catch (error) {
//     console.error("Error getting all public routines!", error);
//     throw error;
//   }
// }

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(/*sql*/`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      INNER JOIN users
      ON routines."creatorId" = users.id
      WHERE users.username = $1;   
    `, [ username ]);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error("Error getting all routines by user!", error);
    throw error;
  }
}

// async function getAllRoutinesByUser({ username }) {
//   try {
//     const routines = await getAllRoutines()
//     const userRoutines = routines.filter((user) => user.creatorName === username);
//     return userRoutines;
//   } catch (error) {
//     console.error("Error getting all public routines!", error);
//     throw error;
//   }
// }

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(/*sql*/`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      INNER JOIN users
      ON routines."creatorId" = users.id
      WHERE users.username = $1 AND routines."isPublic" = true;  
    `, [ username ]);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error("Error getting public routines by user!", error);
    throw error;
  }
}

// async function getPublicRoutinesByUser({ username }) {
//   try {
//     const routines = await getAllRoutines()
//     const userRoutines = routines.filter((user) => user.creatorName === username);
//     const publicUserRoutines = userRoutines.filter((user) => user.isPublic === true);
//     return publicUserRoutines;
//   } catch (error) {
//     console.error("Error getting all public routines!", error);
//     throw error;
//   }
// }

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(/*sql*/`
      SELECT routines.*, 
        routine_activities."routineId", 
        routine_activities."activityId", 
        users.username AS "creatorName"
      FROM routines
      INNER JOIN routine_activities
      ON routines.id = routine_activities."routineId"  
      INNER JOIN users
      ON routines."creatorId" = users.id
      WHERE routine_activities."activityId" = $1 AND routines."isPublic" = true;
    `, [ id ]);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error("Error getting all routines by activity!", error);
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  const setFields = Object.keys(fields)
    .map((key, index) => `"${ key }" = $${ index + 1 }`)
    .join(', ');
  if (setFields.length === 0) {
    return;
  }
  try {
    const { rows: [ routine ] } = await client.query(/*sql*/`
      UPDATE routines
      SET ${ setFields }
      WHERE id = ${ id }
      RETURNING *;
    `, Object.values(fields));
    return routine;
  } catch (error) {
    console.error("Error updating routine!");
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(/*sql*/`
      DELETE FROM routine_activities
      WHERE "routineId" = $1;
    `, [ id ]);
    await client.query(/*sql*/`
      DELETE FROM routines
      WHERE id = ${id}
    `);
  } catch (error) {
    console.error("Error destroying routine!");
    throw error;
  }
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
