const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [ activity ] } = await client.query(/*sql*/`
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `, [ name, description ]);
    return activity;
  } catch (error) {
    console.error("Error creating activity!", error);
    throw error;
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows } = await client.query(/*sql*/`
      SELECT * 
      FROM activities    
    `);
    return rows;
  } catch (error) {
    console.error("Error getting all activities!", error);
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const { rows: [ activity ] } = await client.query(/*sql*/`
      SELECT * 
      FROM activities
      WHERE id = $1;
    `, [ id ]);
    return activity;
  } catch (error) {
    console.error("Error getting activity by id!", error);
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [ activity ] } = await client.query(/*sql*/`
      SELECT * 
      FROM activities
      WHERE name = $1;
    `, [ name ]);
    return activity;
  } catch (error) {
    console.error("Error getting activity by name!", error);
    throw error;
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  try {
    //* Routines
    const routineId = routines
      .map((routine) => routine.id)
      .join(', ');
    const { rows: routine_activities } = await client.query(/*sql*/`
      SELECT * 
      FROM routine_activities
      WHERE "routineId" IN (${ routineId })
    `);

    //* Activities
    const activityId = routine_activities
      .map((activity) => activity.id)
      .join(', ');
    // const { rows: activities } = await client.query(/*sql*/`
    //   SELECT * 
    //   FROM activities
    //   WHERE id IN (${ activityId })
    // `);

    // console.log(activities);

    //* Adding duration, count, routineId, activityId to activities
    const { rows: activitiesDC } = await client.query(/*sql*/`
      SELECT activities.*,
        routine_activities.duration, 
        routine_activities.count, 
        routine_activities."routineId",
        routine_activities.id AS "routineActivityId"  /* You cant have duplicate column names (in this case id) */
      FROM activities
      INNER JOIN routine_activities
      ON activities.id = routine_activities."activityId"
      WHERE activities.id IN (${ activityId });   
    `);
  
    //* Adding activities to routines table
    routines.forEach((routine) => {
      // must filter only the activities related to routine.. without filter was adding all activities to all routines
      routine.activities = activitiesDC.filter((activityDC) => activityDC.routineId === routine.id)
      // routine.activities = activitiesDC
    });

    return routines;

  } catch (error) {
    console.error("Error attaching activities to routines!", error);
    throw error;
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }" = $${ index + 1 }`
  ).join(', ');
  if (setString.length === 0) {
    return;
  }
  try {
    const { rows: [ activity ] } = await client.query(/*sql*/`
      UPDATE activities
      SET ${ setString }
      WHERE id = ${ id }
      RETURNING *;
    `, Object.values(fields));
    return activity;
  } catch (error) {
    console.error("Error updating activity!", error);
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
