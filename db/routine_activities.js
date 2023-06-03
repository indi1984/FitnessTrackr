const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, count, duration }) {
    try {
    const { rows: [ routine_activity ] } = await client.query(/*sql*/`
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [ routineId, activityId, count, duration ]);
    return routine_activity;
  } catch (error) {
    console.error("Error adding activity to routine!", error);
    throw error; 
  }
}

async function getRoutineActivityById(id) {
    try {
    const { rows: [ routine_activity ] } = await client.query(/*sql*/`
      SELECT * 
      FROM routine_activities
      WHERE id = $1
    `, [ id ]);
    return routine_activity;
  } catch (error) {
    console.error("Error getting activity by id!", error);
    throw error; 
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(/*sql*/`
      SELECT * 
      FROM routine_activities
      WHERE id = $1
    `, [ id ]);
    return rows;
  } catch (error) {
    console.error("Error getting routine activities by routine!", error);
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }" = $${ index + 1 }`
  ).join(', ');
  if (setString.length === 0) {
    return;
  }
  try {
    const { rows: [ routine_activity ] } = await client.query(/*sql*/`
      UPDATE routine_activities
      SET ${ setString }
      WHERE id = ${ id }
      RETURNING *;
    `, Object.values(fields));
    return routine_activity;
  } catch (error) {
    console.error("Error updating routine activity!", error);
  }
}

async function destroyRoutineActivity(id) {
    try {
    const { rows: [ routine_activity ] } = await client.query(/*sql*/`
      DELETE 
      FROM routine_activities
      WHERE id = $1
      RETURNING *;
    `, [ id ]);
    return routine_activity;
  } catch (error) {
    console.error("Error deleting routine activity!", error);
    throw error; 
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
    try {
    const { rows: [ routine_activity ] } = await client.query(/*sql*/`
      SELECT * 
      FROM routine_activities
      WHERE id = $1
    `, [ routineActivityId ]);
    const routineId = routine_activity.routineId
    const { rows: [ routine ] } = await client.query(/*sql*/`
      SELECT * 
      FROM routines
      WHERE id = $1
    `, [ routineId ]);
    if (routine.creatorId === userId) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error editing routine activity!", error);
    throw error; 
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
